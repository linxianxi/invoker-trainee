import React, { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { isArrayEqual } from "./utils";
import { Button, Switch } from "antd";

interface StackType {
  index: number;
  key: string;
  translateX: number;
  show: boolean;
}

const skillsArr = [
  ["e", "e", "e"],
  ["e", "e", "q"],
  ["e", "e", "w"],
  ["q", "q", "e"],
  ["q", "q", "q"],
  ["q", "w", "e"],
  ["w", "w", "e"],
  ["w", "w", "q"],
  ["w", "w", "w"],
  ["q", "q", "w"],
];

const difficultyButtons = [
  { text: "简单", step: 1 },
  { text: "一般", step: 2 },
  { text: "困难", step: 3 },
  { text: "地狱", step: 4 },
];

let requestAnimationFrameId: number | null = null;

let count = 0;
// 每帧移动的距离
let step = 1;
// 每个的高度
const height = 72;
// 盒子总高度
const boxHeight = 400;

function App() {
  const [stack, setStack] = useState<StackType[]>([]);
  const [translateY, setTranslateY] = useState(height);
  const [keys, setKeys] = useState(["", "", ""]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(0);
  const [enableHelp, setEnableHelp] = useState(false);

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (["q", "w", "e"].includes(e.key)) {
        setKeys((prev) => prev.slice(1).concat(e.key));
      }
      if (e.key === "r") {
        const rAudio = new Audio(require("./audio/r.mpeg"));
        rAudio.play();
        const reverseIndex = [...stack]
          .reverse()
          .findIndex((i) => isArrayEqual(skillsArr[i.index], keys) && i.show);
        if (reverseIndex > -1) {
          const index = stack.length - reverseIndex - 1;
          setScore((prev) => prev + 1);
          setStack((prev) => {
            const result = [...prev];
            result[index].show = false;
            return result;
          });
          const value = skillsArr[stack[index].index].join("");
          const audio = new Audio(require(`./audio/${value}.mpeg`));
          audio.play();
        }
      }
    },
    [keys, stack]
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyUp]);

  const animate = useCallback(() => {
    if ((boxRef.current?.scrollHeight || 0) >= boxHeight + height * 2) {
      setStack((prev) => {
        const last = prev[prev.length - 1];
        if (last.show) {
          setLost((pre) => pre + 1);
        }
        return prev.slice(0, prev.length - 1);
      });
    }

    setTranslateY((prev) => prev - step);

    const executeCount = Math.round(height / step);
    if (count === executeCount) {
      count = 0;
      setStack((prev) => [
        {
          index: Math.floor(Math.random() * 10),
          key: nanoid(),
          translateX: Math.random() * 240,
          show: true,
        },
        ...prev,
      ]);
      setTranslateY((prev) => prev + height);
    }
    count++;
    requestAnimationFrameId = requestAnimationFrame(animate);
  }, []);

  const stop = useCallback((isPause?: boolean) => {
    if (!isPause) {
      count = 0;
    }
    if (requestAnimationFrameId !== null) {
      cancelAnimationFrame(requestAnimationFrameId);
      requestAnimationFrameId = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();

    const result = [
      {
        index: Math.floor(Math.random() * 10),
        key: nanoid(),
        translateX: Math.random() * 240,
        show: true,
      },
    ];
    setStack(result);
    setTranslateY(height);

    animate();
  }, [animate, stop]);

  return (
    <div className="App">
      <p className="title">卡尔练习生 invoker trainee</p>
      <div className="row">
        <Button.Group>
          {difficultyButtons.map((i) => (
            <Button
              key={i.step}
              onClick={() => {
                step = i.step;
                start();
              }}
            >
              {i.text}
            </Button>
          ))}
        </Button.Group>
        <Button
          type="primary"
          danger
          style={{ marginInline: 10 }}
          onClick={() => {
            requestAnimationFrameId ? stop(true) : animate();
          }}
        >
          暂停(恢复)
        </Button>
        提示：
        <Switch onChange={setEnableHelp} />
      </div>

      <div className="wrapper">
        <span>
          分数: {score} 丢失: {lost}
        </span>
        <div className="box">
          <div
            style={{ transform: `translateY(-${translateY}px)` }}
            ref={boxRef}
          >
            {stack.map((item) => {
              const value = skillsArr[item.index].join("");
              return (
                <div
                  key={item.key}
                  style={{
                    transform: `translateX(${item.translateX}px)`,
                    opacity: item.show ? 1 : 0,
                  }}
                >
                  <img
                    src={require(`./assets/${value}.webp`)}
                    alt=""
                    className="img"
                  />
                  {enableHelp && <span className="help">{value}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bottom">
          {keys.slice(keys.length - 3, keys.length).map((i, index) => (
            <img
              src={i ? require(`./assets/${i}.webp`) : ""}
              alt=""
              className="circle"
              style={{ opacity: i ? 1 : 0 }}
              key={index}
            />
          ))}
          <img src={require("./assets/r.webp")} className="circle" alt="" />
        </div>
      </div>
    </div>
  );
}

export default App;
