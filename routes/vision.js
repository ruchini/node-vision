var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");

// Configure the AWS SDK with your credentials
AWS.config.update({
  accessKeyId: "AKIARAR74F5B2ZJFROOU",
  secretAccessKey: "58t6FYfBVhi0FhEKFwxOWExsgASY3dtg6EHAPcVP",
  region: "us-east-1",
});

router.post("/classify", async function (req, res, next) {
  // Create a new instance of the Rekognition service
  const rekognition = new AWS.Rekognition();
  const image = req.files.file.data;

  // Define parameters for the Rekognition API call
  const params = {
    Image: {
      Bytes: Buffer.from(image, "base64"),
    },
    MaxLabels: 10, // You can change this to the desired number of labels
  };

  try {
    // Call the Rekognition service to detect labels in the image
    const apiData = await rekognition.detectLabels(params).promise();

    // Extract labels from the response
    let response = apiData.Labels.map((label) => label.Name);

    res.json({
      labels: response,
    });
  } catch (error) {
    console.error("Error detecting labels:", error);
  
    if (error.code === "ResourceNotFoundException") {
      res.status(404).json({
        error: "Resource not found. Please check your AWS configuration.",
      });
    } else if (error.code === "InvalidParameterException") {
      res.status(400).json({
        error: "Invalid parameters in the request. Please review your request.",
      });
    } else {
      // Handle unexpected errors
      res.status(500).json({
        error: "An unexpected error occurred while classifying the image.",
      });
    }
  }
});

module.exports = router;
