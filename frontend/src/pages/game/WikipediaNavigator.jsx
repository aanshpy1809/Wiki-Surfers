import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const contentRef = useRef(null);  // Single ref for both content and scrollable container
  const targetReached = currentPage === targetPage;
  const { socket } = useSocketContext();

  // Fetch Wikipedia page content from the MediaWiki API
  const fetchPageContent = async (pageTitle) => {
    try {
      const response = await fetch('/api/wiki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageTitle }),
        });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong!'); 
      }
      setPageContent(data);
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
      }
    };

    // Add click listener to the div containing the Wikipedia content
    const contentDiv = contentRef.current;
    contentDiv?.addEventListener("click", handleLinkClick);

    return () => {
      contentDiv?.removeEventListener("click", handleLinkClick);  // Clean up the event listener
    };
  }, [pageContent, isOpponent, setCurrentPage, targetPage, roomId, socket]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;  // Scroll to top when new page is loaded
    }
  }, [pageContent]);

  // Handle scrolling and emit scroll event to the server
  const handleScroll = useCallback(() => {
    if (!contentRef.current || !socket) return;

    const scrollPosition = contentRef.current.scrollTop;
    console.log(`Scroll position: ${scrollPosition}`);  // Check if the scroll event is being triggered
    socket.emit("scroll", { roomId, scrollPosition });
  }, [socket, roomId]);

  // Add scroll listener and emit scroll event
  useEffect(() => {
    const contentDiv = contentRef.current;
    if (!contentDiv || isOpponent) return;
    
    contentDiv.addEventListener("scroll", handleScroll);

    return () => {
      contentDiv.removeEventListener("scroll", handleScroll);  // Cleanup
    };
  }, [handleScroll]);

  // Listen for syncScroll event and sync opponent's scroll position
  useEffect(() => {
    if (!socket || !contentRef.current ) return;

    socket.on("syncScroll", (data) => {
      console.log(`Received syncScroll: ${data.scrollPosition}`);  // Check if the syncScroll event is received
      if (!isOpponent) return;  // Don't apply scroll sync to opponent's view
      contentRef.current.scrollTop = data.scrollPosition;  // Sync scroll position in this view
    });

    return () => {
      socket.off("syncScroll");  // Cleanup listener
    };
  }, [socket, isOpponent]);

  return (
    <div className="container mx-auto p-5 border-10 overflow-y-auto"
      ref={contentRef}  // Use contentRef for both scrolling and click handling
      style={{ height: '500px', overflowY: !isOpponent ? 'scroll' : 'hidden' }}  // Make sure the container is scrollable
    >
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
