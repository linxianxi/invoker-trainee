import React, { useCallback, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { isArrayEqual } from "./utils";
import { Button, Switch } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { ChangeKeyboardModal } from "./compoents/ChangeKeyboardModal";
import { useKeyboardSetting } from "./hooks/useKeyboardSetting";
import omit from "lodash/omit";
import isEqual from "lodash/isEqual";

interface StackType {
  index: number;
  key: string;
  translateX: number;
  show: boolean;
}

const skillsArr = [
  { keyboard: "y", value: ["q", "q", "q"] },
  { keyboard: "v", value: ["q", "q", "w"] },
  { keyboard: "g", value: ["q", "q", "e"] },
  { keyboard: "c", value: ["w", "w", "w"] },
  { keyboard: "x", value: ["w", "w", "q"] },
  { keyboard: "z", value: ["w", "w", "e"] },
  { keyboard: "t", value: ["e", "e", "e"] },
  { keyboard: "f", value: ["e", "e", "q"] },
  { keyboard: "d", value: ["e", "e", "w"] },
  { keyboard: "b", value: ["q", "w", "e"] },
];

const difficultyButtons = [
  { text: "简单", step: 1 },
  { text: "一般", step: 1.3 },
  { text: "困难", step: 1.6 },
  { text: "地狱", step: 2 },
];

let requestAnimationFrameId: number | null = null;

let count = 0;
// 每帧移动的距离
let step = 1;
// 每个的高度
const height = 80;
// 盒子总高度
const boxHeight = 400;

function App() {
  const [stack, setStack] = useState<StackType[]>([]);
  const [translateY, setTranslateY] = useState(height);
  const [keys, setKeys] = useState(["", "", ""]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lost, setLost] = useState(0);
  // 是否显示帮助信息
  const [enableHelp, setEnableHelp] = useState(false);
  // 是否按下技能键消除
  const [shouldPressSkill, setShouldPressSkill] = useState(false);
  // 当前切出来的技能，是按字母顺序排好的
  const [currentSkills, setCurrentSkills] = useState(["", ""]);
  const [modalVisible, setModalVisible] = useState(false);
  // 键位设置
  const {
    isDotaKeyboard,
    keyboardSetting,
    setIsDotaKeyboard,
    setKeyboardSetting,
  } = useKeyboardSetting();

  // 成功消除
  const removeSkill = useCallback(
    (skill: string[]) => {
      const reverseIndex = [...stack]
        .reverse()
        .findIndex(
          (i) => isArrayEqual(skillsArr[i.index].value, skill) && i.show
        );
      if (reverseIndex > -1) {
        const index = stack.length - reverseIndex - 1;
        setScore((prev) => prev + 1);
        setStack((prev) => {
          const result = [...prev];
          result[index].show = false;
          return result;
        });
        const name = skillsArr[stack[index].index].value.join("");
        const audio = new Audio(require(`./audio/${name}.mpeg`));
        audio.play();
      }
    },
    [stack]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (
        modalVisible ||
        (count > 0 ? requestAnimationFrameId === null : true)
      ) {
        return;
      }

      switch (e.key) {
        case keyboardSetting.q: {
          setKeys((prev) => prev.slice(1).concat("q"));
          break;
        }
        case keyboardSetting.w: {
          setKeys((prev) => prev.slice(1).concat("w"));
          break;
        }
        case keyboardSetting.e: {
          setKeys((prev) => prev.slice(1).concat("e"));
          break;
        }
        case keyboardSetting.r: {
          const rAudio = new Audio(require("./audio/r.mpeg"));
          rAudio.play();
          if (keys.every((i) => !!i)) {
            setCurrentSkills((prev) => {
              const newSkill = [...keys].sort().join("");
              const index = prev.findIndex((i) => !i);
              // 如果当前切出来的技能少于 2 个
              if (index > -1) {
                const result = [...prev];
                result[index] = newSkill;
                return result;
              } else {
                if (newSkill === prev[1]) {
                  return prev;
                }
                return [prev[1], newSkill];
              }
            });
          }
          if (!shouldPressSkill) {
            removeSkill(keys);
          }
          break;
        }
        case keyboardSetting.d: {
          if (!isDotaKeyboard && currentSkills[0]) {
            removeSkill(currentSkills[0].split(""));
            break;
          }
          break;
        }
        case keyboardSetting.f: {
          if (!isDotaKeyboard && currentSkills[1]) {
            removeSkill(currentSkills[1].split(""));
            break;
          }
          break;
        }
        default:
          break;
      }

      if (isDotaKeyboard) {
        const index = skillsArr.findIndex((i) => i.keyboard === e.key);
        if (index > -1) {
          const value = [...skillsArr[index].value];
          if (currentSkills.includes(value.sort().join(""))) {
            removeSkill(value);
          }
        }
      }
    },
    [
      modalVisible,
      isDotaKeyboard,
      keyboardSetting.q,
      keyboardSetting.w,
      keyboardSetting.e,
      keyboardSetting.r,
      keyboardSetting.d,
      keyboardSetting.f,
      keys,
      shouldPressSkill,
      removeSkill,
      currentSkills,
    ]
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyUp]);

  const animate = useCallback(() => {
    if (count - height / step >= 0) {
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
      count = 0;
    }
    count++;

    if ((boxRef.current?.scrollHeight || 0) > boxHeight + height) {
      setStack((prev) => {
        if (prev[prev.length - 1].show) {
          setLost((pre) => pre + 1);
        }
        return prev.slice(0, prev.length - 1);
      });
    }

    setTranslateY((prev) => prev - step);

    requestAnimationFrameId = requestAnimationFrame(animate);
  }, []);

  const stop = useCallback(() => {
    if (requestAnimationFrameId !== null) {
      cancelAnimationFrame(requestAnimationFrameId);
      requestAnimationFrameId = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setScore(0);
    setLost(0);
    count = 0;

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
      <a
        href="https://github.com/linxianxi/invoker-trainee"
        target="_blank"
        className="github"
        rel="noreferrer"
      >
        <GithubOutlined style={{ fontSize: 40 }} />
      </a>
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
          style={{ marginLeft: 10 }}
          onClick={() => {
            if (count > 0) {
              requestAnimationFrameId !== null ? stop() : animate();
            }
          }}
        >
          暂停(恢复)
        </Button>
      </div>
      <div className="row">
        提示：
        <Switch style={{ marginRight: 10 }} onChange={setEnableHelp} />
        按下技能键消除:
        <Switch onChange={setShouldPressSkill} />
        <Button
          type="primary"
          style={{ marginLeft: 10 }}
          onClick={() => setModalVisible(true)}
        >
          改键
        </Button>
      </div>

      <div className="wrapper">
        <span>
          分数: {score} 丢失: {lost}
        </span>
        <div className="box">
          <div
            style={{ transform: `translateY(${-translateY}px)` }}
            ref={boxRef}
          >
            {stack.map((item) => {
              const value = skillsArr[item.index].value.join("");
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
              className={`circle ${shouldPressSkill ? "circle-small" : ""}`}
              style={{ opacity: i ? 1 : 0 }}
              key={index}
            />
          ))}
          {shouldPressSkill &&
            currentSkills.map((i, index) => {
              const name = skillsArr
                .find((skill) => [...skill.value].sort().join("") === i)
                ?.value.join("");
              return (
                <img
                  style={{ opacity: i ? 1 : 0 }}
                  src={i ? require(`./assets/${name}.webp`) : ""}
                  className="circle-small"
                  alt=""
                  key={index}
                />
              );
            })}
          <img
            src={require("./assets/r.webp")}
            className={`circle ${shouldPressSkill ? "circle-small" : ""}`}
            alt=""
          />
        </div>
      </div>

      <ChangeKeyboardModal
        keyboardSetting={keyboardSetting}
        isDotaKeyboard={isDotaKeyboard}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={(values) => {
          setIsDotaKeyboard(values.isDotaKeyboard);
          localStorage.setItem("isDotaKeyboard", String(values.isDotaKeyboard));
          if (!values.isDotaKeyboard) {
            const _keyboardSetting = omit(values, ["isDotaKeyboard"]);
            if (!isEqual(keyboardSetting, _keyboardSetting)) {
              setKeyboardSetting(_keyboardSetting);
              localStorage.setItem(
                "keyboardSetting",
                JSON.stringify(_keyboardSetting)
              );
            }
          }
          setModalVisible(false);
        }}
      />
    </div>
  );
}

export default App;
