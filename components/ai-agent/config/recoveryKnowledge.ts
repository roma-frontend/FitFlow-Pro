// config/recoveryKnowledge.ts
export const recoveryKnowledgeBase = {
  sleep: {
    optimalHours: "7-9",
    bestTime: "22:00 - 6:00",
    qualityTips: [
      "За 1 час до сна избегайте синего света",
      "Поддерживайте температуру в спальне 18-21°C",
      "Используйте техники 4-7-8 дыхания"
    ]
  },
  stretchingPrograms: [
    {
      level: "beginner",
      muscles: ["whole body"],
      exercises: [
        {
          name: "Кошка-корова",
          duration: 2,
          instructions: "На четвереньках попеременно прогибайте и выгибайте спину"
        },
        {
          name: "Растяжка шеи",
          duration: 1,
          instructions: "Медленные наклоны головы в стороны"
        },
        {
          name: "Наклоны вперед",
          duration: 2,
          instructions: "Сидя на полу, тянитесь к носкам"
        }
      ]
    }
  ],
  recoveryMethods: [
    {
      type: "recovery",
      title: "Контрастный душ",
      description: "Чередование горячей и холодной воды",
      steps: [
        "30 секунд горячая вода (38-40°C)",
        "30 секунд холодная вода (15-20°C)",
        "Повторить 5-7 циклов"
      ],
      tips: [
        "Заканчивайте холодной водой",
        "Не используйте при простуде"
      ]
    }
  ]
};