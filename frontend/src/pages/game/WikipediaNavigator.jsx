import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";

const WikipediaNavigator = ({
  currentPage,
  setCurrentPage,
  targetPage,
  clicks,
  setClicks,
  navigatorId,
  isOpponent,  // Flag to indicate if this is the opponent's view
  roomId,
  user
}) => {
  const [pageContent, setPageContent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const contentRef = useRef(null);  // For scrolling
  const targetReached = currentPage === targetPage;
  const { socket } = useSocketContext();

  // Fetch Wikipedia page content from the MediaWiki API
  const fetchPageContent = async (pageTitle) => {
    try {
      const response = await axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
          action: "parse",
          page: pageTitle,
          format: "json",
          origin: "*",  // To handle CORS
        },
      });
      
      setPageContent(response.data.parse.text["*"]);
    } catch (error) {
      console.error("Error fetching Wikipedia page content:", error);
    }
  };

  // Fetch the content of the initial page when the component loads or when the page changes
  useEffect(() => {
    fetchPageContent(currentPage);
  }, [currentPage]);

  // Handle link clicks within the Wikipedia content
  useEffect(() => {
    if (!socket) return;
    const handleLinkClick = (event) => {
      event.preventDefault();

      // Only handle clicks if this is NOT the opponent's view
      if (!isOpponent && event.target.tagName === "A" && event.target.href.includes("/wiki/")) {
        const newPage = event.target.href.split("/wiki/")[1];  // Extract the Wikipedia page title

        // Check if the target page is reached
        if (newPage === targetPage) {
          setGameOver(true);
          socket.emit("reached_target", roomId);  // Notify opponent that the target is reached
        }

        setCurrentPage(newPage);  // Navigate to the new page
        // setClicks((prevClicks) => prevClicks + 1);  // Increment the click counter

        // // Emit the page change event to the opponent
        // socket.emit("navigate_page", { room: roomId, newPage, clicks: clicks + 1 });
      }
    };

    // Add click listener to the div containing the Wikipedia content
    const contentDiv = contentRef.current;
    contentDiv?.addEventListener("click", handleLinkClick);

    return () => {
      contentDiv?.removeEventListener("click", handleLinkClick);  // Clean up the event listener
    };
  }, [pageContent, isOpponent, clicks, setCurrentPage, targetPage, roomId, socket]);


  // window.addEventListener('scroll', () => {
  //   const scrollPosition = window.scrollY;
  //   console.log(scrollPosition);
  //   // Emit the scroll position to the server
  //   socket.emit('scroll', { roomId, scrollPosition });
  // });

  // Handle opponent's navigation events
  // useEffect(() => {
  //   if (!socket) return;

  //   // Listen for navigation event from the opponent
  //   socket.on('syncScroll', (data) => {
  //     // Scroll to the received position
  //     if(!isOpponent) return
  //     window.scrollTo(0, data.scrollPosition);
  //   });

  //   return () => {
  //     socket.off("syncScroll");  // Clean up the listener
  //   };
  // }, [socket, isOpponent]);

  return (
    <div className="container mx-auto p-5 border-10">
      <div className="flex flex-col md:flex-row justify-between">
        <p className="text-xl font-semibold">{user?.username}</p>
        <p className="text-xl font-semibold">Clicks: {clicks}</p>
      </div>

      {/* Game Over Section */}
      {gameOver ? (
        <h2 className="text-2xl font-bold text-green-600">
          Congratulations! You've reached the target page in {clicks} clicks.
        </h2>
      ) : (
        // Render the Wikipedia page content with unique IDs for each navigator
        <div
          id={`wiki-content-${navigatorId}`}
          ref={contentRef}
          className={`prose prose-lg prose-blue max-w-none ${
            isOpponent ? "pointer-events-none" : ""  // Disable interaction for the opponent's screen
          }`}
          dangerouslySetInnerHTML={{ __html: pageContent }}
        />
      )}
    </div>
  );
};

export default WikipediaNavigator;
