// app.ts
import express from "express";
import cors from "cors";
import clientRoutes from "./routes/client.routes";
import listRouter from "./routes/list.router";
import paymentRouter from "./routes/payment.routes";
import authRoutes from "./routes/auth.routes";
import listGroupRoutes from "./routes/listGroup.routes";
import serviceRoutes from "./routes/services.routes"; // New import
import dashboardRoutes from "./routes/dashboard.router";
import formAnswersRoutes from "./routes/formAnswers.router";
import { sequelize } from "./database";

// Models
import Client from "./models/client";
import List from "./models/list";
import ListGroup from "./models/list_group";
import Service from "./models/service";
import UserService from "./models/user_services";
import NamesList from "./models/name_list";
import ServiceForm from "./models/service_form"; // New import
import FormField from "./models/form_fields"; // New import
import ServiceFormFieldAnswer from "./models/form_fields_anserws";
import ServiceFormSubmission from "./models/submission_group";
import StatusHistory from "./models/status_history";

// Configure model associations
if (Client.associate) Client.associate();
if (StatusHistory.associate) StatusHistory.associate();
if (ServiceFormSubmission) ServiceFormSubmission.associate();
if (List.associate) List.associate();
if (ListGroup.associate) ListGroup.associate();
if (Service.associate) Service.associate();
if (UserService.associate) UserService.associate();
if (NamesList.associate) NamesList.associate();
if (ServiceForm.associate) ServiceForm.associate(); // New association
if (FormField.associate) FormField.associate(); // New association
if (ServiceFormFieldAnswer.associate) ServiceFormFieldAnswer.associate();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Sync database
sequelize.sync().then(() => {
  console.log("Database connected");
});

const PORT = process.env.PORT || 3001;

// Register routes
app.use("/client", clientRoutes);
app.use("/cobranca", paymentRouter);
app.use("/auth", authRoutes); // Rota de autenticação
app.use("/list", listRouter);
app.use("/list-groups", listGroupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/services", serviceRoutes); // New route
app.use("/form-answers", formAnswersRoutes);

app.listen(3001, () => {
  console.log(`Server is running on  port ${PORT}`);
});
