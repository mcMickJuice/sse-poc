import express, { Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let clients: {
  id: number;
  response: Response<any, Record<string, any>>;
}[] = [];

app.get("/health", (_, res) => {
  res.sendStatus(200);
});

app.get("/events", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  const data = `data: ${JSON.stringify({ message: "init" })}\n\n`;
  res.write(data);

  const clientId = Date.now();
  console.log(`clientId: ${clientId} connected`);
  const client = {
    id: clientId,
    response: res,
  };
  clients.push(client);

  req.on("close", () => {
    console.log(`${clientId} connection closing`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});

let testCount = 0;

app.post("/test", (_, res) => {
  console.log("ack");
  testCount += 1;
  clients.forEach((client) => {
    console.log("writing to", client.id);
    const message = `data: ${JSON.stringify({ count: testCount })}\n\n`;
    client.response.write(message);
  });
  res.send({
    message: "done",
  });
});

app.listen(3000, () => {
  console.log("App listening on 3000");
});
