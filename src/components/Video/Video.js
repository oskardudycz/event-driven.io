import React from "react"
const Video = ({ videoSrcURL, videoTitle, ...props }) => 
{
    const embedId = videoSrcURL.substring(videoSrcURL.lastIndexOf("v=") + 2);

    return (    
    <div>
    <div className="video">
        <iframe
            src={`https://www.youtube.com/embed/${embedId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={videoTitle}
        />
    </div>
    {/* --- STYLES --- */}
    <style jsx>{`
        .video {
            position:relative;
            padding-top:56.25%;
        }
        .video iframe{
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
        }
        `}</style>
    </div>
    )
}
export default Video