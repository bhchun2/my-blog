---
title: 서보 드라이브가 복잡해 보이는 진짜 이유 — 3중 루프 하나로 정리하기
date: 2026-07-21
type: blog-draft
tags: [모터기초, 서보시스템, blog]
source: '[[서보_Block_Diagram]]'
created: 2026-07-21
---

# 서보 드라이브가 복잡해 보이는 진짜 이유 — 3중 루프 하나로 정리하기

> **"안쪽 루프가 바깥쪽 루프보다 5~10배 빠르지 않으면, 캐스케이드 제어는 작동하지 않는다."**
> 서보 드라이브 설계에서 가장 자주 인용되는 원칙입니다. ([MotionControlTips](https://www.motioncontroltips.com/why-is-the-bandwidth-of-a-servo-control-loop-important/))

## 서보 드라이브 = 3개의 중첩된 제어 루프

PLC/CNC가 위치 지령(θ*)을 던지면, 서보 드라이브 안에서는 위치 → 속도 → 전류 순으로 3개 루프가 안쪽으로 중첩되어 돌아갑니다.

| 루프 | 대역폭 | 역할 |
|---|---|---|
| 전류 (최내부) | ~1~2 kHz | d·q축 전류 추종, 토크 직접 제어 |
| 속도 (중간) | ~100~500 Hz | 외란에 강인한 속도 유지 |
| 위치 (최외부) | ~10~100 Hz | P/PD 제어, 엔코더 위치 피드백 |

전류 루프는 속도 루프보다 5~10배, 속도 루프는 위치 루프보다 그만큼 더 빠릅니다. 우연히 정해진 비율이 아닙니다.

## 왜 안쪽 루프가 훨씬 빨라야 할까

캐스케이드 제어의 기본 원리 때문입니다: **안쪽 루프의 응답 속도가 바깥쪽 루프보다 느리면, 바깥쪽 루프는 안쪽 루프를 사실상 "없는 것처럼" 취급하고 제어할 수 없습니다.** 그래서 업계 표준은 안쪽 루프 대역폭을 바깥쪽의 5~10배로 설계하는 것을 원칙으로 삼습니다. ([DesignWorld / MotionControlTips FAQ](https://www.designworldonline.com/faq-what-are-servo-motor-current-velocity-and-position-loops-and-bandwidths/))

실제 PMSM Field-Oriented Control에서도 전류 루프는 보통 10kHz급 스위칭 주파수를 기준으로 설계되고, 전류 측정에는 1.6kHz 컷오프 필터가 흔히 쓰입니다 — 전류 루프가 "가장 빠른 루프"라는 원칙이 실제 구현 수치로도 그대로 확인됩니다. ([Imperix, FOC of PMSM](https://imperix.com/doc/implementation/field-oriented-control-of-pmsm))

## 피드포워드: 루프가 못 따라가는 구간을 메우는 지름길

3중 루프만으로는 빠른 지령 변화에 항상 뒤처지기 마련입니다. 그래서 실무에서는 세 가지 피드포워드 경로를 덧붙입니다.

- **속도 피드포워드**: 위치 지령을 미분해 속도 루프에 바로 더해줌
- **가속도 피드포워드**: 속도 미분 × 관성(J)을 전류 지령에 바로 더해줌
- **역기전력 피드포워드**: d·q축 교차결합(cross-coupling)을 보상

d·q 축 간 교차결합을 전압 피드포워드로 보상하는 기법은 실제로 PMSM 전류 제어 연구에서도 표준적으로 쓰이는 디커플링 방식입니다. ([MathWorks, PMSM FeedForward Control](https://www.mathworks.com/help/mcb/ref/pmsmfeedforwardcontrol.html))

## 결론

서보 드라이브 블록도가 복잡해 보이는 이유는 기능이 많아서가 아니라, **각 루프가 정확히 5~10배씩 느려지도록 의도적으로 층을 쌓았기** 때문입니다. 이 비율이 깨지면 아무리 게인을 잘 튜닝해도 시스템은 진동하거나 응답이 느려집니다. 서보 튜닝을 시작하기 전에 "내 전류/속도/위치 루프 대역폭 비율이 5~10배인가?"부터 확인하는 게 순서입니다.

---
### Sources
- [FAQ: What are servo motor current, velocity and position loops and bandwidths? — DesignWorld/MotionControlTips](https://www.designworldonline.com/faq-what-are-servo-motor-current-velocity-and-position-loops-and-bandwidths/)
- [Why is the bandwidth of a servo control loop important? — MotionControlTips](https://www.motioncontroltips.com/why-is-the-bandwidth-of-a-servo-control-loop-important/)
- [Field Oriented Control of PMSM — imperix](https://imperix.com/doc/implementation/field-oriented-control-of-pmsm)
- [PMSM FeedForward Control — MathWorks](https://www.mathworks.com/help/mcb/ref/pmsmfeedforwardcontrol.html)

> 원출처: [[서보_Block_Diagram]] (모터기초_온톨리지)
