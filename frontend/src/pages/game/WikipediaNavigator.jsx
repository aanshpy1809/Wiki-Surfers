import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { set } from "mongoose";

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
  const [isfetching, setIsfetching] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const contentRef = useRef(null);  // Single ref for both content and scrollable container
  const targetReached = currentPage === targetPage;
  const { socket } = useSocketContext();

  // Fetch Wikipedia page content from the MediaWiki API
  const fetchPageContent = async (pageTitle, check) => {
    setIsfetching(true);
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
      if(!check){
        setPageContent(data);
      }
      
      
      return data;
    } catch (error) {
      
      toast.error(error.message);
    } finally {
      setIsfetching(false);
    }
  };

  // Fetch the content of the initial page when the component loads or when the page changes
  useEffect(() => {
    
    fetchPageContent(currentPage, false);
  }, [currentPage]);

  // Handle link clicks within the Wikipedia content
  useEffect(() => {
    if (!socket) return;
    
    const handleLinkClick =async (event) => {
      event.preventDefault();

      // Only handle clicks if this is NOT the opponent's view
      if (!isOpponent && event.target.tagName === "A" && event.target.href.includes("/wiki/")) {
        const newPage = event.target.href.split("/wiki/")[1];  // Extract the Wikipedia page title

        // Check if the target page is reached
        
        
        const check=await fetchPageContent(newPage, true);
        
        if(check===undefined){
          return
        }
        setCurrentPage(newPage);  // Navigate to the new page
        setClicks((prev) => prev + 1);
        localStorage.setItem("userClicks", clicks + 1);
        localStorage.setItem("userPage", newPage);
        socket.emit("navigate_page", { room: roomId, newPage, clicks: clicks + 1 });
        
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
        // Check if the syncScroll event is received
      if (!isOpponent) return;  // Don't apply scroll sync to opponent's view
      contentRef.current.scrollTop = data.scrollPosition;  // Sync scroll position in this view
      
    });

    return () => {
      socket.off("syncScroll");  // Cleanup listener
    };
  }, [socket, isOpponent]);

  return (
    
    <div className="container mx-auto p-5 border-10 overflow-y-auto max-h-[500px]"
      ref={contentRef}  // Use contentRef for both scrolling and click handling
      style={{ overflowY: !isOpponent ? 'scroll' : 'hidden' }}  // Make sure the container is scrollable
    >
         {isfetching && (
        <div className="mt-10 flex min-h-screen items-center justify-center">
          <div className="spinner"></div>
        </div>
      )}
        {pageContent && !isfetching && <div
          id={`wiki-content-${navigatorId}`}
          className={`prose prose-lg prose-blue max-w-none ${
            isOpponent ? "pointer-events-none" : ""  // Disable interaction for the opponent's screen
          }`}
          dangerouslySetInnerHTML={{ __html: pageContent }}
        />}
        
    </div>
    
  );
};

export default WikipediaNavigator;
