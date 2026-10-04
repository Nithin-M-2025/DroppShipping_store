require("dotenv").config();

const express = require("express");
const {open} = require("sqlite");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const path = require("path");
const Razorpay = require("razorpay")
const crypto = require("crypto")
const multer = require("multer") 
const {notifyOrderSuccess, startAbandonedCartJob} = require("./notifications") 
const {imageSearch} = require("./imageSearch") 

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const dbPath = path.join(__dirname, "Database.db");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
});

const WHATSAPP_REGEX = /^\+[1-9]\d{7,14}$/;

const parseJSON = (value, fallback = []) => {
    try {
        return JSON.parse(value || JSON.stringify(fallback));
    } catch (error) {
        return fallback;
    }
};

const parseProducts = (product) => {
    const images = parseJSON(product.images).map((image, index) =>
        typeof image === "string" ? {id: index, src: image} : image
    );

    let variants = parseJSON(product.variants);

    if (
        variants.length === 0 &&
        product.price !== null &&
        product.price !== undefined
    ) {
        variants = [
            {
                id: `default-${product.id}`,
                title: "Default",
                price: product.price,
                compare_at_price: null,
            },
        ];
    }

    return {
        ...product,
        images,
        options: parseJSON(product.options),
        variants,
        tags: parseJSON(product.tags),
    };
};

const getUserFromRequest = (request) => {
    const header = request.headers.authorization || "";
    const token = header.split(" ")[1];
    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET); // {username, id}
    } catch (error) {
        return null;
    }
};

// NEW: blocks the request when nobody is logged in
const authenticateToken = (request, response, next) => {
    const user = getUserFromRequest(request);

    if (!user) {
        response.status(401);
        response.send({errorMsg: "Please log in first"});
        return;
    }

    request.user = user;
    next();
};

// NEW: lets the request through either way, request.user is null for guests
const optionalAuth = (request, response, next) => {
    request.user = getUserFromRequest(request);
    next();
};

let db = null;
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        startAbandonedCartJob(db); // NEW: starts only once db is ready
        app.listen(3000, () => {
            console.log("Server is running at http://localhost:3000");
        });
    }
    catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

app.get("/", async (request, response) => {
    const getProductsQuery = `
        SELECT * FROM Products;
    `;

    const productsArray = await db.all(getProductsQuery);
    response.send(productsArray.map(parseProducts));
})


app.get("/products/:id", async (request, response) => {
    const {id} = request.params
    const getProductQuery = `SELECT * FROM Products WHERE id = ?;`
    const product = await db.get(getProductQuery, [id])

    if (!product) {
        response.status(404).send({error: "Product not found"})
        return
    }

    response.send(parseProducts(product))
});

app.post("/login" , async (request , response) => {
    const {username , password} = request.body;

    if(!username || !password) {
        response.status(400);
        response.send({errorMsg: "Username and password are required"});
        return;
    }

    const getUserQuery = `SELECT * FROM users WHERE username = ?;`;
    const dbUser = await db.get(getUserQuery, [username])

    if (!dbUser) {
        response.status(400)
        response.send({errorMsg: "Invalid username"})
        return
    }

    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password_hash)

    if (!isPasswordCorrect) {
        response.status(400)
        response.send({errorMsg: "Invalid password"})
        return
    }

    const payload = {username: dbUser.username, id: dbUser.id}
    const jwtToken = jwt.sign(payload, JWT_SECRET)

    response.send({jwtToken})
});


app.post("/register", async (request, response) => {
    try {
        const {name, username, password, whatsapp_number} = request.body // CHANGED

        if (!username || !password) {
            response.status(400)
            response.send({errorMsg: "Username and password are required"})
            return
        }

        if (password.length < 6) {
            response.status(400)
            response.send({errorMsg: "Password must be at least 6 characters"})
            return
        }

        // NEW: WhatsApp number is optional, but must be valid when given
        const whatsappNumber = String(whatsapp_number || "").trim()
        if (whatsappNumber && !WHATSAPP_REGEX.test(whatsappNumber)) {
            response.status(400)
            response.send({errorMsg: "Enter WhatsApp number like +91XXXXXXXXXX"})
            return
        }

        const checkUserQuery = `SELECT * FROM users WHERE username = ?;`
        const existingUser = await db.get(checkUserQuery, [username])

        if (existingUser) {
            response.status(400)
            response.send({errorMsg: "Username already taken"})
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const createUserQuery = `
            INSERT INTO users (username, password_hash, name, whatsapp_number)
            VALUES (?, ?, ?, ?);
        ` // CHANGED
        await db.run(createUserQuery, [
            username,
            hashedPassword,
            name || null,
            whatsappNumber || null,
        ])

        response.status(201)
        response.send({message: "User registered successfully"})
    } catch (error) {
        console.log(`Register Error: ${error.message}`)
        response.status(500)
        response.send({errorMsg: "Something went wrong on the server"})
    }
})

// NEW: lets a logged-in user add or change their WhatsApp number
app.put("/me/whatsapp", authenticateToken, async (request, response) => {
    const number = String(request.body.whatsapp_number || "").trim()

    if (!WHATSAPP_REGEX.test(number)) {
        response.status(400)
        response.send({errorMsg: "Enter WhatsApp number like +91XXXXXXXXXX"})
        return
    }

    await db.run(`UPDATE users SET whatsapp_number = ? WHERE id = ?;`, [
        number,
        request.user.id,
    ])
    response.send({message: "WhatsApp number saved"})
})

// NEW: keeps a server copy of the cart, this resets the 24 hour clock
app.put("/cart/sync", authenticateToken, async (request, response) => {
    const items = Array.isArray(request.body.items) ? request.body.items : []

    if (items.length === 0) {
        await db.run(`DELETE FROM abandoned_carts WHERE user_id = ?;`, [
            request.user.id,
        ])
        response.send({message: "Cart cleared"})
        return
    }

    await db.run(
        `INSERT INTO abandoned_carts (user_id, items, updated_at, reminded)
         VALUES (?, ?, CURRENT_TIMESTAMP, 0)
         ON CONFLICT(user_id) DO UPDATE SET
             items = excluded.items,
             updated_at = CURRENT_TIMESTAMP,
             reminded = 0;`,
        [request.user.id, JSON.stringify(items)],
    )
    response.send({message: "Cart synced"})
})

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CHANGED: also saves the order (with its items and the logged-in user)
app.post("/create-order", optionalAuth, async (request, response) => {
    try {
        const {amount, items} = request.body // amount in rupees, from your cart total

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise (smallest unit)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        }

        const order = await razorpayInstance.orders.create(options)

        await db.run(
            `INSERT INTO orders (user_id, razorpay_order_id, items, amount)
             VALUES (?, ?, ?, ?);`,
            [
                request.user?.id || null,
                order.id,
                JSON.stringify(Array.isArray(items) ? items : []),
                Number(amount),
            ],
        )

        response.send(order)
    } catch (error) {
        console.log(`Razorpay Order Error: ${error.message}`)
        response.status(500)
        response.send({errorMsg: "Could not create order"})
    }
});


// CHANGED: marks the order paid, clears the abandoned cart, sends WhatsApp
app.post("/verify-payment", async (request, response) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = request.body

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

    if (generatedSignature !== razorpay_signature) {
        response.status(400)
        response.send({success: false, errorMsg: "Payment verification failed"})
        return
    }

    // `status != 'paid'` makes sure a repeated call never sends a second message
    let paidOrder = null
    try {
        const result = await db.run(
            `UPDATE orders SET status = 'paid', razorpay_payment_id = ?
             WHERE razorpay_order_id = ? AND status != 'paid';`,
            [razorpay_payment_id, razorpay_order_id],
        )

        if (result.changes > 0) {
            paidOrder = await db.get(
                `SELECT * FROM orders WHERE razorpay_order_id = ?;`,
                [razorpay_order_id],
            )
        }
    } catch (error) {
        console.log(`Order Update Error: ${error.message}`)
    }

    // The payment is verified, so the customer always gets success
    response.send({success: true})

    if (paidOrder?.user_id) {
        try {
            await db.run(`DELETE FROM abandoned_carts WHERE user_id = ?;`, [
                paidOrder.user_id,
            ])
            await notifyOrderSuccess(db, paidOrder)
        } catch (error) {
            console.log(`Post-payment Error: ${error.message}`)
        }
    }
})

// NEW: search products by uploading a photo
app.post("/search/image", upload.single("image"), (request, response) =>
    imageSearch(db, parseProducts, request, response),
)



const VALID_TYPES = ['products', 'electronics']

app.get('/reviews/:productType/:productId', async (req, res) => {
    const {productType, productId} = req.params

    if (!VALID_TYPES.includes(productType)) {
        return res.status(400).json({message: 'Invalid product type'})
    }

    try {
        const reviews = await db.all(
            `SELECT id, name, rating, comment, created_at
             FROM reviews
             WHERE product_type = ? AND product_id = ?
             ORDER BY id DESC`,
            [productType, productId],
        )
        res.json(reviews)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to fetch reviews'})
    }
})

app.post('/reviews', async (req, res) => {
    const {product_type, product_id, name, rating, comment} = req.body

    if (
        !VALID_TYPES.includes(product_type) ||
        !product_id ||
        !name?.trim() ||
        !comment?.trim() ||
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
    ) {
        return res.status(400).json({message: 'Invalid review data'})
    }

    try {
        const result = await db.run(
            `INSERT INTO reviews (product_type, product_id, name, rating, comment)
             VALUES (?, ?, ?, ?, ?)`,
            [product_type, String(product_id), name.trim(), Number(rating), comment.trim()],
        )
        res.status(201).json({id: result.lastID})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to save review'})
    }
})