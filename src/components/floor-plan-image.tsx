import { useEffect, useState } from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { generateSmallestDimension } from "../utils";
import { Dimension, ImageStatus } from "../type";
import { Vector2d } from "konva/lib/types";

const PADDING = 24;

interface Props {
  url: string;
  stageDimension: {
    width: number;
    height: number;
  };
  onImageLoad: (params: {
    startingPosition: Vector2d;
    startingDimension: Dimension;
    status: ImageStatus;
  }) => void;
}

const FloorPlanImage = ({ url, stageDimension, onImageLoad }: Props) => {
  const [image, status] = useImage(url);
  const [imageDimension, setImageDimension] = useState<Dimension>({
    width: 0,
    height: 0,
  });
  const [imagePosition, setImagePosition] = useState<Vector2d>({ x: 0, y: 0 });

  useEffect(() => {
    if (status === "loaded" && image) {
      const { width: stageW, height: stageH } = stageDimension;
      const { width: imageW, height: imageH } = image;

      const stageCenter = {
        x: stageW / 2,
        y: stageH / 2,
      };

      const startingDimension = generateSmallestDimension(
        stageW,
        stageH,
        imageW,
        imageH,
        PADDING * 2,
      );
      const startingPosition = {
        x: stageCenter.x - startingDimension.width / 2,
        y: stageCenter.y - startingDimension.height / 2,
      };

      setImageDimension(startingDimension);
      setImagePosition(startingPosition);
      onImageLoad({ startingPosition, startingDimension, status });
    }
  }, [image]);

  return (
    <Image
      name="floor-plan__img"
      image={image}
      width={imageDimension.width}
      height={imageDimension.height}
      x={imagePosition.x}
      y={imagePosition.y}
      stroke="#D8DADE"
      cornerRadius={5}
      shadowColor="#292D37"
      shadowOffset={{ x: 0, y: 1 }}
      shadowBlur={5}
      shadowOpacity={0.15}
    />
  );
};

export default FloorPlanImage;
