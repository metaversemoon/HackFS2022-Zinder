import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

export const ConfettiHearts = () => {
  const { width, height } = useWindowSize();

  return (
    <Confetti
      drawShape={(ctx: any) => {
        ctx.scale(0.2, -0.2);
        ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
        ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
        ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
        ctx.stroke();
        ctx.closePath();
      }}
      recycle={false}
      width={width}
      height={height}
      tweenDuration={1500}
      numberOfPieces={200}
    />
  );
};
