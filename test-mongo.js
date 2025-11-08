const mongoose = require("mongoose");
const url = "mongodb://127.0.0.1:27017/event-management";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{ console.log("Connected OK"); process.exit(0); })
  .catch(err=>{ console.error("Connect error:", err.message); process.exit(1); });
