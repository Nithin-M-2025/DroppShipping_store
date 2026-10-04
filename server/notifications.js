const twilio = require("twilio")
const cron = require("node-cron")

// Created on first use, so a missing .env value never crashes server startup
let client = null
const getClient = () => {
    if (!client) {
        client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN,
        )
    }
    return client
}

// Template variables can't contain newlines or long runs of spaces
const clean = (text, max = 300) => {
    const flat = String(text || "").split(/\s+/).join(" ").trim()
    return flat.length > max ? `${flat.slice(0, max)}...` : flat
}

const parseItems = value => {
    try {
        return JSON.parse(value || "[]")
    } catch (error) {
        return []
    }
}

const sendTemplate = async (toNumber, contentSid, variables) => {
    try {
        const message = await getClient().messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${toNumber}`,
            contentSid,
            contentVariables: JSON.stringify(variables),
        })
        return {ok: true, sid: message.sid}
    } catch (error) {
        console.log("WhatsApp send failed:", error.message)
        return {ok: false, error: error.message}
    }
}

const summarizeItems = items => {
    if (!items.length) return "your items"
    const titles = items.slice(0, 2).map(item => item.title)
    const extra = items.length - titles.length
    return clean(titles.join(", ") + (extra > 0 ? ` and ${extra} more` : ""))
}

// 1) Successful sale. `order` is a row from the orders table
const notifyOrderSuccess = async (db, order) => {
    const user = await db.get(
        "SELECT name, username, whatsapp_number FROM users WHERE id = ?;",
        [order.user_id],
    )
    if (!user?.whatsapp_number) return

    await sendTemplate(user.whatsapp_number, process.env.TWILIO_ORDER_CONTENT_SID, {
        1: clean(user.name || user.username, 50),
        2: String(order.id),
        3: summarizeItems(parseItems(order.items)),
        4: `₹${Number(order.amount).toFixed(2)}`,
    })
}

// 2) Cart left for 24 hours without buying
const startAbandonedCartJob = db => {
    cron.schedule("*/30 * * * *", async () => {
        try {
            const carts = await db.all(
                `SELECT c.user_id, c.items, u.name, u.username, u.whatsapp_number
                 FROM abandoned_carts c
                 JOIN users u ON u.id = c.user_id
                 WHERE c.reminded = 0
                   AND c.updated_at <= datetime('now', '-24 hours')
                   AND u.whatsapp_number IS NOT NULL;`,
            )

            for (const cart of carts) {
                // Mark first so a slow or failed send can never cause a duplicate
                await db.run(
                    "UPDATE abandoned_carts SET reminded = 1 WHERE user_id = ?;",
                    [cart.user_id],
                )

                const items = parseItems(cart.items)
                if (!items.length) continue

                await sendTemplate(
                    cart.whatsapp_number,
                    process.env.TWILIO_CART_CONTENT_SID,
                    {
                        1: clean(cart.name || cart.username, 50),
                        2: summarizeItems(items),
                        3: `${process.env.FRONTEND_URL}/cart`,
                    },
                )
            }
        } catch (error) {
            console.log("Abandoned cart job failed:", error.message)
        }
    })
}

module.exports = {notifyOrderSuccess, startAbandonedCartJob}