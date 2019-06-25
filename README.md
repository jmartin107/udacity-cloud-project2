# Udagram Image Filtering Microservice

Simple service that retrieves a public image file, applies a filter and displays the filtered image.

## :zap: Quickstart

1. Clone the repo
2. cd into the project root and run `npm install`
3. run `npm run dev`

## Endpoints

* **URL**

  /filteredImage/?image_url

* **Method:**
  
  GET
  
*  **URL Params**

   **Required:**
 
   `image_url=[string]`

* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** The filtered image file

* **Sample Call:**

  http://localhost:8082/filteredimage?image_url=https://timedotcom.files.wordpress.com/2019/03/kitten-report.jpg

* **Notes:**

This endpoint requires authorization. Provide the authentication token using the Authentication header using the value of Bearer [token]
  