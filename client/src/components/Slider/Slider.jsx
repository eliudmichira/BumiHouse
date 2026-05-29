import React, { useState, useEffect } from 'react'
import "./slider.scss";

const Slider = ({images}) => {
  const[imageIndex, setImageIndex] = useState (null);
  const[arrowDisplay, setArrowDisplay] = useState (null);
// change slide function
  const changeSlide = (direction) => {
    if (direction === "left") {
      if (imageIndex === 0) {
setImageIndex(images.length - 1);
      } else {
        setImageIndex(imageIndex - 1);
        
      }      
    } 
    else {
      if (imageIndex === images.length - 1) {
        setImageIndex(0);
      } else {
        setImageIndex(imageIndex + 1)
      }
    }
  }
// handle esc button function when esc button is pressed on the keyboard
    function handleEsc (event){
      if (event.key === 'Escape') {
       setImageIndex (null)
     }
   }  
   window.addEventListener('keydown', handleEsc);

// function when next key is pressed on the keyboard 
//    function nextKey (event){
//     if (event.key === 'ArrowRight') {
//      changeSlide("right")
//    }
//  } 
//  window.addEventListener('keydown', nextKey);

// // function when previous key is pressed on the keyboard
//  function prevKey (event){
//   if (event.key === 'ArrowLeft') {
//    changeSlide("left")
//  }
// }

// window.addEventListener('keydown', prevKey);


   

  return (
     <div className='slider'>
    {imageIndex !==null && ( 
    <div className='fullSlider'>
      <div className='arrow' onClick={() => changeSlide("left")}><img src='/white-arrow .jpg' className='leftArrow'></img></div>
      <div className='imgContainer'><img src={images[imageIndex]}></img></div>
      <div className='arrow' onClick={() => changeSlide("right")}> <img src='/white-arrow .jpg' className='rightArrow'></img></div>
      <div className='close' onClick={() => setImageIndex(null) }>X</div>
    </div>
  )}
    <div className='bigImage'>
      <img src={images[0]} alt='' onClick={() => setImageIndex(0)}/>
    </div>
    
    <div className='smallImages'>
      {images.slice(1).map((image, index)=>(<img src={image} alt='' key={index}
        onClick={() => setImageIndex(index + 1)}
      />)) }
    </div>  

  
   
  </div>
  )
}

export default Slider;