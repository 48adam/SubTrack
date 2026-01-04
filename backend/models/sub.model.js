const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Sub = new Schema(
    {
        user: {
            type: ObjectId,
            ref: "User"
        },

        name:{
            type: String,
            required: true
        },

        amount:{
            type: Number,
            required: true
        },

        // Kategoria subskrypcji (np. Rozrywka, Praca)
        category: {
            type: String,
            enum: ["rozrywka","praca","zdrowie", "edukacja","inne"],
            required: true,
            lowercase: true
        },

        startDate: {
            type: Date,
            default: Date.now
        },

        endDate: {
            type: Date,
            required: true
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Subscription", Sub);