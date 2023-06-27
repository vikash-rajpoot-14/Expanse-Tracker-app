const mongoose = require("mongoose");

const DownloadfileSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const Downloadfile = mongoose.model("Downloadfile", DownloadfileSchema);
module.exports = Downloadfile;
