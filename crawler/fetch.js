import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const BASE = "https://courseap2.itc.ntnu.edu.tw";
const INDEX = `${BASE}/acadmOpenCourse/index.jsp`;
const API = `${BASE}/acadmOpenCourse/CofopdlCtrl`;
const DEPT_API = `${BASE}/acadmOpenCourse/CofnameCtrl`;
const GU_API = `${BASE}/acadmOpenCourse/cofopdlGeneral.do`;
const DENSE_API = `${BASE}/acadmOpenCourse/coftmscDate.do`;

const GU_CORE = ["A1UG","A2UG","A3UG","A4UG","B1UG","B2UG","B3UG","C1UG","C2UG"];
const GU_MAP = {
  "人文藝術":"A1UG","社會科學":"A2UG","自然科學":"A3UG","邏輯運算":"A4UG",
  "學院共同課程":"B1UG","跨域專業探索課程":"B2UG","大學入門":"B3UG",
  "專題探究":"C1UG","MOOCs":"C2UG"
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function createClient() {
  const jar = new CookieJar();
  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    timeout: 60000,
    headers: {
      "Referer": INDEX,
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "zh-TW,zh;q=0.9"
    }
  }));
  await client.get(INDEX);     // 先拿 session
  await sleep(1000);           // Python 有 sleep
  return client;
}

function baseParams(year, term, dept) {
  return {
    _dc: Date.now(),
    acadmYear: year,
    acadmTerm: term,
    deptCode: dept,
    action: "showGrid",
    language: "chinese",
    start: 0,
    limit: 2000,               // Python 不拉爆
    page: 1,
    chn: "", engTeach: "N", clang: "N", moocs: "N",
    remoteCourse: "N", digital: "N", adsl: "N",
    zuDept: "", classCode: "", kind: "",
    generalCore: "", teacher: "", serial_number: "", course_code: ""
  };
}

async function safeGet(client, url, params) {
  try {
    const r = await client.get(url, { params });
    await sleep(800);          // 每次 request 都慢
    return r;
  } catch {
    await sleep(1000);         // 出錯也慢
    return null;
  }
}

export async function fetchAll(year, term) {
  const client = await createClient();

  // 1) 科系列表（照 Python）
  const deptRes = await safeGet(client, DEPT_API, {
    _dc: Date.now(), action: "cof", type: "chn",
    year, term, page: 1, start: 0, limit: 25
  });
  const deptList = deptRes ? JSON.parse(deptRes.data.replace(/'/g,'"')) : [];
  const depts = deptList.map(d => d[0]);

  const all = [];

  // 2) 逐系抓（GU 拆 core）
  for (const dept of depts) {
    if (dept === "GU") {
      for (const core of GU_CORE) {
        const p = baseParams(year, term, "GU");
        p.kind = 3;
        p.generalCore = core;
        const r = await safeGet(client, API, p);
        if (r?.data?.List) {
          for (const c of r.data.List) {
            c.generalCore = c.generalCore ? `${c.generalCore}/${core}` : core;
            all.push(c);
          }
        }
      }
    } else {
      const r = await safeGet(client, API, baseParams(year, term, dept));
      if (r?.data?.List) all.push(...r.data.List);
    }
  }

  // 3) 去重（Python 同樣邏輯）
  const seen = new Set();
  const uniq = [];
  for (const c of all) {
    const key = c.serial_no || `${c.course_code}-${c.course_group}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(c);
  }

  // 4) 補通識核心 & 密集課程（逐門慢慢補）
  const denseMap = {};
  for (const c of uniq) {
    if (c.option_code === "通" && !c.generalCore) {
      const r = await safeGet(client, GU_API, {
        _dc: Date.now(), action: "show",
        acadmYear: c.acadm_year, acadmTerm: c.acadm_term,
        courseCode: c.course_code, courseGroup: c.course_group,
        deptCode: c.dept_code, deptGroup: c.dept_group_name || "",
        formS: c.form_s || "", aClass: c.classes || "", language: "chinese"
      });
      const m = /109以後入學：([^<]+)/.exec(r?.data?.msg || "");
      if (m && GU_MAP[m[1].trim()]) c.generalCore = GU_MAP[m[1].trim()];
    }

    if ((c.time_inf || "").includes("密集課程")) {
      const r = await safeGet(client, DENSE_API, {
        _dc: Date.now(), action: "show",
        acadmYear: c.acadm_year, acadmTerm: c.acadm_term,
        courseCode: c.course_code, courseGroup: c.course_group,
        deptCode: c.dept_code, deptGroup: c.dept_group_name || "",
        formS: c.form_s || "", aClass: c.classes || "", language: "chinese"
      });
      denseMap[`${c.course_code}-${c.course_group}`] = r?.data?.msg || "";
    }
  }

  return { courses: uniq, denseMap };
}
