id = '0dbd5g';
const resultType = localStorage.getItem('resultType');

const title = document.getElementById('typeTitle');

const detail = document.getElementById('typeDetail');

const TYPE_DATABASE = {
  CGVP: {
    position: '중심',
    density: '집중',
    direction: '수직',
    structure: '점',

    desc: '자신의 내면 목표와 정체성이 매우 강하게 응축된 유형. 한 가지 가치나 목표에 몰입하는 경향이 강하며 자기 확신이 뚜렷함.',
  },

  CGVL: {
    position: '중심',
    density: '집중',
    direction: '수직',
    structure: '선',

    desc: '삶의 방향성이 명확하며 자신의 기준을 따라 꾸준히 밀고 나가는 유형. 집중된 에너지가 지속적인 추진력으로 이어짐.',
  },

  CGVS: {
    position: '중심',
    density: '집중',
    direction: '수직',
    structure: '면',

    desc: '강한 자기중심성과 안정된 내적 구조를 가진 유형. 자신의 세계관 안에서 질서와 체계를 구축하려는 경향이 큼.',
  },

  CGHP: {
    position: '중심',
    density: '집중',
    direction: '수평',
    structure: '점',

    desc: '타인과의 관계 속에서도 자신의 감정과 욕구가 선명하게 드러나는 유형. 감정적 존재감이 강함.',
  },

  CGHL: {
    position: '중심',
    density: '집중',
    direction: '수평',
    structure: '선',

    desc: '관계와 감정의 흐름이 삶의 핵심이 되는 유형. 특정 관계나 감정선이 오래 지속되는 경향이 있음.',
  },

  CGHS: {
    position: '중심',
    density: '집중',
    direction: '수평',
    structure: '면',

    desc: '인간관계 기반의 안정된 영역을 형성하는 유형. 친밀한 공동체나 소속 안에서 강한 안정감을 느낌.',
  },

  CDVP: {
    position: '중심',
    density: '분산',
    direction: '수직',
    structure: '점',

    desc: '자신의 가능성과 관심사가 여러 방향으로 퍼져 있는 유형. 중심은 유지하지만 목표가 자주 변화할 수 있음.',
  },

  CDVL: {
    position: '중심',
    density: '분산',
    direction: '수직',
    structure: '선',

    desc: '다양한 경험과 방향성을 탐색하며 성장하는 유형. 삶의 흐름 속에서 여러 목표가 이어짐.',
  },

  CDVS: {
    position: '중심',
    density: '분산',
    direction: '수직',
    structure: '면',

    desc: '스스로의 세계를 넓게 확장하려는 경향이 강한 유형. 다방면의 관심과 경험이 하나의 구조를 형성함.',
  },

  CDHP: {
    position: '중심',
    density: '분산',
    direction: '수평',
    structure: '점',

    desc: '관계 속에서 다양한 감정과 연결을 탐색하는 유형. 감정 변화와 인간관계 폭이 넓은 편.',
  },

  CDHL: {
    position: '중심',
    density: '분산',
    direction: '수평',
    structure: '선',

    desc: '여러 사람과의 관계가 이어지며 삶의 흐름을 만드는 유형. 폭넓은 교류 속에서 에너지를 얻음.',
  },

  CDHS: {
    position: '중심',
    density: '분산',
    direction: '수평',
    structure: '면',

    desc: '넓은 인간관계와 사회적 영역 속에서 안정감을 형성하는 유형. 다양한 관계망 안에서 자신만의 자리를 구축함.',
  },

  EGVP: {
    position: '외곽',
    density: '집중',
    direction: '수직',
    structure: '점',

    desc: '외부 세계의 자극과 목표에 강하게 몰입하는 유형. 사회적 성취나 현실적 목표에 대한 추진력이 큼.',
  },

  EGVL: {
    position: '외곽',
    density: '집중',
    direction: '수직',
    structure: '선',

    desc: '사회적 성공이나 외부 성과를 향해 꾸준히 나아가는 유형. 외부 환경의 영향력이 삶의 흐름에 크게 작용함.',
  },

  EGVS: {
    position: '외곽',
    density: '집중',
    direction: '수직',
    structure: '면',

    desc: '현실적 기반과 사회적 구조를 안정적으로 구축하려는 유형. 외부 세계 속에서 자신의 영역을 확장함.',
  },

  EGHP: {
    position: '외곽',
    density: '집중',
    direction: '수평',
    structure: '점',

    desc: '타인과 외부 관계에서 존재감을 강하게 드러내는 유형. 사회적 인정 욕구와 감정 표현력이 큼.',
  },

  EGHL: {
    position: '외곽',
    density: '집중',
    direction: '수평',
    structure: '선',

    desc: '인간관계와 사회적 연결이 지속적으로 이어지는 유형. 관계 속 영향력과 존재감이 강함.',
  },

  EGHS: {
    position: '외곽',
    density: '집중',
    direction: '수평',
    structure: '면',

    desc: '넓은 사회적 네트워크와 관계 기반을 안정적으로 구축하는 유형. 공동체 안에서 중심 역할을 하기도 함.',
  },

  EDVP: {
    position: '외곽',
    density: '분산',
    direction: '수직',
    structure: '점',

    desc: '외부 환경과 다양한 목표 사이에서 끊임없이 움직이는 유형. 새로운 가능성을 탐색하려는 욕구가 큼.',
  },

  EDVL: {
    position: '외곽',
    density: '분산',
    direction: '수직',
    structure: '선',

    desc: '삶의 방향이 유동적이며 다양한 경험과 변화가 이어지는 유형. 이동과 변화 속에서 성장함.',
  },

  EDVS: {
    position: '외곽',
    density: '분산',
    direction: '수직',
    structure: '면',

    desc: '외부 세계의 다양한 경험을 넓게 흡수해 자신만의 영역을 형성하는 유형. 변화 적응력이 높음.',
  },

  EDHP: {
    position: '외곽',
    density: '분산',
    direction: '수평',
    structure: '점',

    desc: '다양한 사람과 감정적 교류를 시도하는 유형. 새로운 관계와 자극에 쉽게 끌리는 경향이 있음.',
  },
};

if (resultType === 'NONE') {
  title.innerText = 'NONE';

  detail.innerHTML = `

  <h2>무결성</h2>

  <p>
  어떠한 점도 존재하지 않는 상태.
  어떤 패턴에도 속하지 않는
  비분류 상태.
  </p>
  `;
} else {
  const typeData = TYPE_DATABASE[resultType];

  title.innerText = resultType;

  detail.innerHTML = `

  <h2>
  ${resultType}
  </h2>

  <p>
  <strong>중심/외곽:</strong>
  ${typeData.position}
  </p>

  <p>
  <strong>집중/분산:</strong>
  ${typeData.density}
  </p>

  <p>
  <strong>방향:</strong>
  ${typeData.direction}
  </p>

  <p>
  <strong>형태:</strong>
  ${typeData.structure}
  </p>

  <hr>

  <p>
  ${typeData.desc}
  </p>
  `;
}
