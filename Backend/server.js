require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

connectToDB()
.then(() => {
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
})
.catch((error) => {
console.error("Database connection failed:", error);
process.exit(1);
});
