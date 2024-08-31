import React, { useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/Store";
import { fetchGifByTerm } from "../../../../../redux/Slices/GifSlice";

interface FrozenGifProps {
  image: string;
  text: string;
}

export const FeedPostCreatorFrozenGif: React.FC<FrozenGifProps> = ({
  image,
  text,
}) => {
  const preview = useSelector((state: RootState) => state.gif.preview);
  const dispatch: AppDispatch = useDispatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const freezeGif = () => {
    if (canvasRef && canvasRef.current && imageRef && imageRef.current) {
      let width = 290;
      let height = 150;

      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const context = canvasRef.current.getContext("2d");

      if (context !== null && preview) {
        context.font = "bold 32px Arial";
        context.textAlign = "left";
        context.fillStyle = "white";
        context.drawImage(imageRef.current, 0, 0, width, height);
        context.fillText(text, 12, 138);
      }
    }
  };

  const handleCanvasClicked = () => {
    //TODO once we have it setup
    if (preview) dispatch(fetchGifByTerm(text));
  };

  return (
    <>
      <img src={image} alt="" ref={imageRef} onLoad={freezeGif} hidden />
      <canvas ref={canvasRef} onClick={handleCanvasClicked}></canvas>
    </>
  );
};
