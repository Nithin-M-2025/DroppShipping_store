const {GoogleGenAI} = require("@google/genai")

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash"
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const PROMPT = `You help shoppers find products in an online clothing and accessories store.
Look at the image and reply with JSON only, in this shape:
{"description": "<one short sentence about the item>", "keywords": ["<5 to 10 lowercase single words a product title or description might contain: item type, color, material, style>"]}`

const scoreProduct = (product, keywords) => {
    const title = String(product.title || "").toLowerCase()
    const rest = [product.description, product.brand, product.category, ...(product.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

    return keywords.reduce(
        (score, word) =>
            score + (title.includes(word) ? 3 : 0) + (rest.includes(word) ? 1 : 0),
        0,
    )
}

// db and parseProducts are passed in at request time, so db is already ready
const imageSearch = async (db, parseProducts, request, response) => {
    if (!request.file || !ALLOWED_TYPES.includes(request.file.mimetype)) {
        response.status(400)
        response.send({message: "Please upload a JPG, PNG or WebP image"})
        return
    }

    try {
        const aiResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    inlineData: {
                        mimeType: request.file.mimetype,
                        data: request.file.buffer.toString("base64"),
                    },
                },
                {text: PROMPT},
            ],
            config: {responseMimeType: "application/json"},
        })

        const {description = "", keywords = []} = JSON.parse(aiResponse.text)
        const words = keywords.map(word => String(word).toLowerCase())

        const rows = await db.all("SELECT * FROM Products;")

        const results = rows
            .map(parseProducts)
            .map(product => ({product, score: scoreProduct(product, words)}))
            .filter(entry => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map(({product}) => ({
                id: product.id,
                title: product.title,
                price: product.variants?.[0]?.price ?? product.price,
                image: product.images?.[0]?.src || "",
            }))

        response.send({description, results})
    } catch (error) {
        console.log(`Image Search Error: ${error.message}`)
        response.status(500)
        response.send({message: "Image search failed"})
    }
}

module.exports = {imageSearch}