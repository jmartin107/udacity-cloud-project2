import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  filterImageFromURL,
  deleteLocalFiles,
  validateFileType
} from "./util/util";
import * as path from "path";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { NextFunction } from "connect";
import { config } from "./config/config";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: "No authorization headers." });
  }

  const token_bearer = req.headers.authorization.split(" ");
  if (token_bearer.length != 2) {
    return res.status(401).send({ message: "Malformed token." });
  }

  const token = token_bearer[1];

  return jwt.verify(token, config.jwt.secret, err => {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate." });
    }
    return next();
  });
}

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  const token = jwt.sign(config.jwt.username, config.jwt.secret);

  console.log("token: ", token);
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file

  /**************************************************************************** */

  app.get(
    "/filteredImage",
    requireAuth,
    asyncHandler(async (req, res, next) => {
      let image_url = req.query.image_url;

      // Check if the image_url query parameter exists
      if (!image_url) {
        res.status(400).send("Image URL is missing");
        return next();
      }

      // Check if the URL file type is valid
      if (!validateFileType(image_url)) {
        res.status(400).send("Image Mime type is not valid");
        return next();
      }

      try {
        let imagePath = await filterImageFromURL(image_url);
        let absoluteImagePath = path.join(__dirname, "util", imagePath);
        res.status(200).sendFile(absoluteImagePath, err => {
          if (err) {
            return res.status(500).send("Failed to send image file");
          }
          deleteLocalFiles([absoluteImagePath]);
        });
      } catch (error) {
        res.status(400).send("File conversion failed." + error);
      }
    })
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('Error: ', err.stack)
    res.status(500).send('Application Error');
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
