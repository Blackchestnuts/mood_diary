import { db } from "@/lib/db";

// 默认心情模板
const TEMPLATES = [
  {
    name: "今日小确幸",
    emoji: "🌸",
    color: "#FBCFE8",
    description: "记录今天那些微小而确定的幸福",
    prompts: "今天发生的让你微笑的小事|此刻最想感谢的人或事|明天期待的一件小事",
    category: "daily",
    sortOrder: 1,
  },
  {
    name: "深夜独白",
    emoji: "🌙",
    color: "#C7D2FE",
    description: "夜深人静时,与自己对话",
    prompts: "此刻心里最真实的感受|白天没说出口的那句话|给明天的自己一句悄悄话",
    category: "mood",
    sortOrder: 2,
  },
  {
    name: "雨天心情",
    emoji: "🌧️",
    color: "#BAE6FD",
    description: "下雨天适合把心事写下来",
    prompts: "这场雨让你想起了谁|此刻最想待在什么地方|雨停之后最想做的一件事",
    category: "mood",
    sortOrder: 3,
  },
  {
    name: "阳光灿烂",
    emoji: "☀️",
    color: "#FEF08A",
    description: "把明亮的心情装进日记里",
    prompts: "今天最亮眼的瞬间|想和谁分享这份阳光|一个让你充满能量的画面",
    category: "mood",
    sortOrder: 4,
  },
  {
    name: "旅行记忆",
    emoji: "✈️",
    color: "#A7F3D0",
    description: "在路上遇见的风景与故事",
    prompts: "今天走过最难忘的路|遇到的一位有趣的陌生人|一个想永远记住的画面",
    category: "mood",
    sortOrder: 5,
  },
  {
    name: "成长手记",
    emoji: "🌱",
    color: "#BBF7D0",
    description: "写给正在成长的自己",
    prompts: "今天学到的最重要的一课|自己身上闪光的一点|想放下的一件事",
    category: "mood",
    sortOrder: 6,
  },
  {
    name: "思念的信",
    emoji: "💌",
    color: "#FECDD3",
    description: "写给那个想念却见不到的人",
    prompts: "最想对ta说的一句话|你们之间最珍贵的回忆|希望ta此刻过得怎样",
    category: "mood",
    sortOrder: 7,
  },
  {
    name: "自由书写",
    emoji: "🍃",
    color: "#D9F99D",
    description: "没有格式,随心想,随手写",
    prompts: "此刻脑海里冒出的第一个词|最想说的一句废话|放空大脑五分钟后的感受",
    category: "mood",
    sortOrder: 8,
  },
];

// 预置的"陌生人"漂流日记池 —— 用于漂流时随机匹配
const SAMPLE_DRIFT_DIARIES = [
  {
    title: "今天的天空很温柔",
    content:
      "下班回家的路上,抬头看见一大片橘粉色的云,像被打翻的颜料。\n\n突然就停下来了,站在路口看了很久。旁边有个小女孩也仰着头看,她妈妈拽她走,她一步三回头。\n\n原来陌生人之间,也能共享同一场黄昏。",
    mood: "calm",
  },
  {
    title: "给自己的一封信",
    content:
      "亲爱的自己:\n\n最近辛苦了。我知道你总是对自己太严苛,总觉得自己不够好。但我想告诉你,你已经做得很好了。\n\n那个深夜还在赶方案的你,那个为了朋友强撑微笑的你,那个明明很累还是去跑步的你——我都看见了。\n\n请记得好好吃饭,好好睡觉,好好爱自己。",
    mood: "grateful",
  },
  {
    title: "雨天的小店",
    content:
      "下雨了,躲进一家没去过的小咖啡店。\n\n点了一杯热可可,窗外的雨敲着玻璃,店里放着很老的爵士乐。老板一个人在吧台后面擦杯子,不说话。\n\n这种时刻特别安心,好像全世界都慢了下来,只剩雨声和我。",
    mood: "calm",
  },
  {
    title: "失眠的夜",
    content:
      "又是一个睡不着的夜晚。\n\n翻来覆去,脑子里全是乱七八糟的事。明天的会议、上周说错的一句话、三年前那个没赴的约。\n\n我打开窗,外面很安静,远处有零星的犬吠。原来深夜的城市,也有它温柔的一面。\n\n也许睡不着,是身体在提醒我:你该停下来了。",
    mood: "anxious",
  },
  {
    title: "外婆的院子",
    content:
      "今天突然很想外婆。\n\n想起小时候在她家的院子,夏天傍晚,她摇着蒲扇给我讲牛郎织女。葡萄架下的风是甜的,蝉鸣一阵一阵。\n\n外婆已经走了五年了。我没有很经常想起她,但每次想起,心口都会轻轻地疼一下。\n\n也许爱就是这样,不喧哗,但一直在。",
    mood: "thoughtful",
  },
  {
    title: "陌生人的善意",
    content:
      "今天地铁很挤,我手里抱着一摞资料,摇摇晃晃快站不住了。\n\n一个穿白T恤的男生默默站起来,把座位让给我,什么也没说就走到车门边。\n\n我连谢谢都没来得及说出口他就下车了。\n\n这个城市很大很冷,但偶尔,会有这样的小光。",
    mood: "grateful",
  },
  {
    title: "一个人的生日",
    content:
      "今天是我生日,一个人过的。\n\n下班买了块小蛋糕,点了一根蜡烛,对着镜子给自己唱了生日歌。许的愿望就不说了,说出来就不灵了。\n\n其实一个人也没什么不好,只是吹蜡烛的时候,有点希望有人在旁边。\n\n明年这个时候,会不一样吗?",
    mood: "sad",
  },
  {
    title: "海边的一下午",
    content:
      "翘了半天班,跑到海边。\n\n海风咸咸的,浪一遍遍打过来又退回去。我脱了鞋踩在沙里,脚趾陷进去,很踏实。\n\n手机静音丢在包里,谁的消息都没回。好像把整个世界都关在了海的那一边。\n\n回去要面对的还是要面对,但至少这几个小时,我是自由的。",
    mood: "happy",
  },
  {
    title: "凌晨三点的便利店",
    content:
      "失眠,下楼去便利店。\n\n店员小哥戴着耳机在整理货架,看见我点了个头。我买了一罐热牛奶和一包薯片,坐在窗边吃。\n\n玻璃外是空荡荡的街,只有便利店的灯亮着,像这座城市的夜灯。\n\n突然觉得,我们这些凌晨不睡的人,都是彼此的陌生人,也是彼此的同行者。",
    mood: "thoughtful",
  },
  {
    title: "重新开始",
    content:
      "今天做了一个决定:辞掉那份做了三年的工作。\n\n说不清是冲动还是蓄谋已久,交辞职信的时候手都在抖。但走出来那一刻,阳光特别刺眼,我居然笑了。\n\n不知道未来会怎样,可能更好,可能更糟。但至少,我又重新握住了方向盘。\n\n致未来的自己:别忘了今天这份勇气。",
    mood: "excited",
  },
  {
    title: "和老友的重逢",
    content:
      "今天和八年没见的大学室友吃饭。\n\n我以为会尴尬,结果一见面就跟昨天才分开一样。她还是那样,笑起来眼睛弯弯的,吃东西特别香。\n\n我们聊了整整四个小时,从当年的宿舍八卦聊到现在各自的烦恼。\n\n原来真正的朋友,是隔多久都不会生疏的人。",
    mood: "happy",
  },
  {
    title: "窗台的多肉",
    content:
      "养了半年的多肉,今天开花了。\n\n我以为它早就死了,因为它一直皱皱的,我也没怎么管它。没想到它偷偷憋着一朵小花,今天早上突然冒了出来。\n\n生命真是奇妙。你以为它放弃了,它其实在等你看见它努力的样子。\n\n今天也给自己一个小小的鼓励吧。",
    mood: "grateful",
  },
];

async function main() {
  console.log("🌱 开始播种...");

  // 1. 心情模板
  const existingTemplates = await db.moodTemplate.count();
  if (existingTemplates === 0) {
    for (const t of TEMPLATES) {
      await db.moodTemplate.create({ data: t });
    }
    console.log(`✓ 已创建 ${TEMPLATES.length} 个心情模板`);
  } else {
    console.log(`• 心情模板已存在 ${existingTemplates} 条,跳过`);
  }

  // 2. 示例漂流日记池 —— 用一个固定的"系统匿名会话"
  let systemSession = await db.session.findFirst({
    where: { nickname: "漂流瓶守护者" },
  });
  if (!systemSession) {
    systemSession = await db.session.create({
      data: {
        id: "system-drift-pool",
        nickname: "漂流瓶守护者",
        avatarSeed: "driftpool",
      },
    });
  }

  const existingSamples = await db.diary.count({
    where: { isSample: true, status: "drifting" },
  });
  if (existingSamples === 0) {
    for (const d of SAMPLE_DRIFT_DIARIES) {
      await db.diary.create({
        data: {
          title: d.title,
          content: d.content,
          mood: d.mood,
          type: "drift",
          authorId: systemSession.id,
          status: "drifting",
          isSample: true,
        },
      });
    }
    console.log(`✓ 已创建 ${SAMPLE_DRIFT_DIARIES.length} 篇示例漂流日记`);
  } else {
    console.log(`• 示例漂流日记已存在 ${existingSamples} 条,跳过`);
  }

  console.log("🌱 播种完成!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
