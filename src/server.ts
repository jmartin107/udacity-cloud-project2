import express from "express";
import bodyParser from "body-parser";
import {
  filterImageFromURL,
  deleteLocalFiles,
  validateFileType
} from "./util/util";
import * as path from "path";
import asyncHandler from "express-async-handler";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

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
    asyncHandler(async (req, res, next) => {
      let image_url = req.query.image_url;

      // Check if the image_url query parameter exists
      if (!image_url) {
        res.status(400).send("Image URL is missing");
        return next();
      }

      // Check if the URL file type is valid
      if (!validateFileType(image_url)) {
        res.status(400).send("Image Mime type is not valid")
        return next();
      }

      try {
        let isValidURL = validateFileType(image_url);
        
        let imagePath = await filterImageFromURL(image_url);
        let absoluteImagePath = path.join(__dirname, "util", imagePath);
        res.status(200).sendFile(absoluteImagePath, function(err: any) {
          if (!err) {
            deleteLocalFiles([absoluteImagePath]);
          } else {
            res.status(400).send("Send File failed");
          }
        });
      } catch (error) {
        res.status(400).send("File conversion failed." + error);
      }
    })
  );
  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  app.use(
    (
      err: { stack: any },
      req: any,
      res: { status: (arg0: number) => { send: (arg0: string) => void } },
      next: any
    ) => {
      /* now here if your error in development then send stack trace to display whole error,
    if it's in production then just send error message and log error with some library as winston etc.. */
      // if(process.env.NODE_ENV === 'production') {
      //  return res.status(500).send(`something wen't wrong`);
      //}
      res.status(500).send(`hey!! we caugth the error 👍👍, ${err.stack} `);
    }
  );

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
