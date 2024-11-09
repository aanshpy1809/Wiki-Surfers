import { redis } from "../db/redis.js";
import axios from "axios";
import * as cheerio from "cheerio";
import zlib from 'zlib';
import { promisify } from "util";


const compress = promisify(zlib.gzip);
const decompress = promisify(zlib.gunzip);

export const fetchWikiPage=async(req,res)=>{
    try {
        let {pageTitle}=req.body;
        const exists = await redis.exists(pageTitle);
        if (exists) {
            
            const compressedData = await redis.getBuffer(pageTitle); // Retrieve binary data
            const decompressedData = await decompress(compressedData);
            const data = decompressedData.toString();

            
            return res.status(200).json(data);
        }

        

        let response = await axios.get("https://en.wikipedia.org/w/api.php", {
            params: {
              action: "parse",
              page: pageTitle,
              format: "json",
              origin: "*",  
              redirects: true,
            },
          });

          if (response.data.error) {
            
            return res.status(400).json({ error: "Page not found! Please try other link" });
          }
          
          let htmldata = response.data.parse.text["*"];
          
          // Parse the HTML using cheerio to detect a manual redirect
          const $ = cheerio.load(htmldata);
      
          // Check for a redirect message in the HTML
          const redirectLink = $(".redirectMsg .redirectText a").attr("title");
          
          if (redirectLink) {
            
            pageTitle = redirectLink;  // Update pageTitle to redirect target
      
            // Refetch the page with the redirected title
            response = await axios.get("https://en.wikipedia.org/w/api.php", {
              params: {
                action: "parse",
                page: pageTitle,
                format: "json",
                origin: "*",
              },
            });
            
            htmldata = response.data.parse.text["*"];  // Update with new page data
          }

          const compressedData = await compress(htmldata);
          
          await redis.set(pageTitle, compressedData); 
          await redis.expire(pageTitle, 86400); 
          
        
        
        
        res.status(200).json(htmldata);
    } catch (error) {
        console.log("Error in fetchWikiPage controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}