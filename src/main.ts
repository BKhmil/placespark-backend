import express, { type Request, type Response } from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "ping" });
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
