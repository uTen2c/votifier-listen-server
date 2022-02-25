import net from "net";
import crypto from "crypto";

const SECRET = "test"

const main = async () => {
    const server = net.createServer(socket => {
        const challenge = crypto.randomUUID();
        socket.write(`VOTIFIER 2.0 ${challenge}`)

        socket.on("data", data => {
            const buf = data as Buffer;
            try {
                const content = JSON.parse(buf.subarray(4).toString())
                const payload = JSON.parse(content.payload);
                const signature = content.signature

                if (signature !== sign(payload)) {
                    socket.write(JSON.stringify({status: "error", errorMessage: "Signature verification failed"}))
                    return
                }

                console.log(payload)
                socket.write(JSON.stringify({status: "ok"}))
            } catch (e) {
                console.error(e)
            }
        })

        socket.on("error", data => {
            console.log("error: " + data)
        })
    })
    server.listen(8192, "0.0.0.0", () => {
        console.log("listening 0.0.0.0:8192")
    })
}

const sign = (payload: object): string => {
    const string = JSON.stringify(payload);
    const digest = crypto.createHmac("sha256", SECRET);
    digest.update(string)
    return digest.digest("base64")
}

(async () => await main())()
