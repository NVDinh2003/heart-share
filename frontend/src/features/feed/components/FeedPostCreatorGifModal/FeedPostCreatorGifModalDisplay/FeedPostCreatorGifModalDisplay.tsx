import React, { useEffect, useRef, useState } from "react";

import "./FeedPostCreatorGifModalDisplay.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../redux/Store";
import { fetchNextGifs } from "../../../../../redux/Slices/GifSlice";
import { FeedPostCreatorFrozenGif } from "../FrozenGifComponent/FeedPostCreatorFrozenGifComponent";
import { PostImage } from "../../../../../utils/GlobalInterface";
import { updateCurrentPost } from "../../../../../redux/Slices/PostSlice";
import { updateDisplayGif } from "../../../../../redux/Slices/ModalSlice";

interface FeedPostCreatorGifModalDisplayProps {
  gifs: string[];
  handleClick?: (gif: string) => void;
}

export const FeedPostCreatorGifModalDisplay: React.FC<
  FeedPostCreatorGifModalDisplayProps
> = ({ gifs, handleClick }) => {
  //
  const state = useSelector((state: RootState) => state.gif);
  const dispatch: AppDispatch = useDispatch();

  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  const hiddenDiv = useRef<HTMLDivElement>(null);

  const loadNextGifs = (entries: any) => {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting) {
        // console.log("get the next set of gifs", state.next);
        dispatch(
          fetchNextGifs({
            term: state.searchTerm,
            next: state.next,
          })
        );
      }
      // else console.log("not visible");
    });
  };

  const addGif = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!handleClick) {
      attachGifToPost(e);
    } else {
      handleClick(e.currentTarget.id);
    }
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const attachGifToPost = (e: React.MouseEvent<HTMLImageElement>) => {
    let postImage: PostImage = {
      imageId: 0,
      imageName: `${state.searchTerm}-gif`,
      imageType: "gif",
      imageURL: e.currentTarget.id,
    };

    let imgs = [postImage];
    dispatch(
      updateCurrentPost({
        name: "images",
        value: imgs,
      })
    );

    dispatch(updateDisplayGif());
  };

  useEffect(() => {
    if (hiddenDiv && hiddenDiv.current) {
      const observer = new IntersectionObserver(loadNextGifs, {
        root: null,
        threshold: 1,
      });

      const target = hiddenDiv.current;

      observer.observe(target);
    }
  }, []);

  return (
    <div className="feed-post-creator-gif-modal-display">
      <div className="feed-post-creator-gif-modal-display-auto-selection">
        <p className="feed-post-creator-gif-modal-display-auto-text">
          Auto-play GIFs
        </p>
        <label className="feed-post-creator-gif-modal-switch">
          <input type="checkbox" onClick={toggleAutoPlay} checked={autoPlay} />
          <span className="feed-post-creator-gif-modal-slider"></span>
        </label>
      </div>

      <div className="feed-post-creator-gif-modal-display-gif-container">
        {autoPlay
          ? gifs.map((gif) => (
              <img
                alt="gif"
                key={gif}
                src={gif}
                className="feed-post-creator-gif-modal-display-gif"
                id={gif}
                onClick={addGif}
              />
            ))
          : gifs.map((gif) => (
              <FeedPostCreatorFrozenGif
                image={gif}
                text={state.searchTerm}
                handleClick={handleClick}
              />
            ))}
      </div>

      <div id="autoload" ref={hiddenDiv} hidden={state.gifs.length === 0}></div>
    </div>
  );
};
