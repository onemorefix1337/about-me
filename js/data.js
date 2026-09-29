/**
 * OneMoreFix (onemorefix1337) Portfolio Data Architecture
 * 3D Schematic Galaxy / Cyber-Constellation Network Nodes
 */

const SCHEMATIC_DATA = {
  profile: {
    handle: "onemorefix1337",
    name: "OneMoreFix",
    title: "Low-Level Systems & Reverse Engineering Architect",
    status: "SYS_ONLINE // 2026",
    location: "CYBERSPACE // LOCALHOST",
    bio: "Разработчик низкоуровневых систем, модов и графических движков. Специализация на реверс-инжиниринге, хукинге Win32 процессов, внедрении DLL, перехвате протоколов (CDP/WebSocket) и архитектуре 3D-движков на C++20 / OpenGL 4.6.",
    stats: [
      { label: "REPOSITORIES", value: "6 ACTIVE" },
      { label: "PRIMARY STACK", value: "C++20 / WIN32 / GL" },
      { label: "SPECIALTY", value: "HOOKING & INJECTION" },
      { label: "PHILOSOPHY", value: "ZERO BLOAT // NATIVE" }
    ],
    skills: [
      "C++20 / C++",
      "Win32 API",
      "DLL Injection",
      "Memory Hooking",
      "Chrome DevTools Protocol (CDP)",
      "OpenGL 4.6 Core",
      "EnTT (ECS Architecture)",
      "Java / Android NDK",
      "Python Scripting",
      "CMake / Toolchains"
    ],
    github: "https://github.com/onemorefix1337"
  },

  nodes: [
    {
      id: "core",
      code: "00",
      title: "OneMoreFix",
      category: "CORE ARCHITECT",
      subtitle: "Systems & Reverse Engineering",
      coords: { x: 0, y: 0, z: 0 },
      geometry: "icosahedron",
      color: 0xffffff,
      accent: "#ffffff",
      status: "CORE_ONLINE",
      badge: "ORIGIN [0, 0, 0]",
      summary: "Центральное ядро портфолио. Архитектура низкоуровневых решений, реверс-инжиниринг проприетарного софта, системное программирование под Windows и Android.",
      details: [
        "Глубокая экспертиза в C++20, многопоточности и низкоуровневом взаимодействии с ОС Windows.",
        "Практика создания инжекторов, хуков памяти и перехвата событий браузерных движков (Chromium/WebView2).",
        "Создание легковесных инструментов без раздутых зависимостей (zero-bloat philosophy).",
        "Инженерный подход: код нацелен на решение реальных практических задач и расширение возможностей существующего ПО."
      ],
      tech: ["C++20", "Win32 API", "Reverse Engineering", "DLL Injection", "OpenGL 4.6", "Java / Android", "Python"],
      links: [
        { label: "GitHub Profile", url: "https://github.com/onemorefix1337", primary: true },
        { label: "All Repositories", url: "https://github.com/onemorefix1337?tab=repositories" }
      ]
    },
    {
      id: "ymhub",
      code: "01",
      title: "YMHub & Beta",
      category: "DESKTOP MOD",
      subtitle: "Yandex Music Overlay & Injected DLL",
      coords: { x: -44, y: 14, z: -28 },
      geometry: "octahedron",
      color: 0xffffff,
      accent: "#ffffff",
      status: "STABLE v2.1.1 // BETA ACTIVE",
      badge: "FLAGSHIP",
      summary: "Компактный мини-плеер поверх всех окон, горячие клавиши и инжектируемый DLL-мод для десктопного приложения Яндекс Музыки (WebView2).",
      details: [
        "Always-on-top компактный мини-плеер без переключения на главное окно и без потери фокуса ввода.",
        "Прямой биндинг и управление через Chrome DevTools Protocol (CDP over WebSocket) в рантайм React/Chromium.",
        "Твики интерфейса: кастомный регулятор яркости и размытия анимации «Моя Волна» (Vibe), прозрачный сайдбар.",
        "Динамические анимированные RGB-границы плеера и элементов управления.",
        "Голосовое управление воспроизведением через встроенный Windows SAPI Speech Engine.",
        "Встроенная система самообновления (Auto Update Checker) и разделение на стабильную и beta ветки."
      ],
      tech: ["C++", "CMake", "Win32 API", "WebView2", "WebSocket / CDP", "Windows SAPI", "DLL Hooking"],
      links: [
        { label: "GitHub: ymhub (Stable)", url: "https://github.com/onemorefix1337/ymhub", primary: true },
        { label: "GitHub: ymhub-beta", url: "https://github.com/onemorefix1337/ymhub-beta" },
        { label: "Web Page: ymhub Portal", url: "https://onemorefix1337.github.io/ymhub/" }
      ]
    },
    {
      id: "forge",
      code: "02",
      title: "Forge",
      category: "SYSTEM TOOL",
      subtitle: "Dynamic Win32 DLL Injector & Loader",
      coords: { x: -50, y: -16, z: 24 },
      geometry: "box",
      color: 0xffffff,
      accent: "#ffffff",
      status: "v1.3.3 PRODUCTION",
      badge: "CORE UTILITY",
      summary: "Высокопроизводительный инжектор и загрузчик модов для Windows-приложений с автоматическим управлением процессами.",
      details: [
        "Низкоуровневая доставка библиотек в память целевого процесса через Win32 API.",
        "Multi-target архитектура: динамический выбор репозитория и ассетов в зависимости от выбранного канала (Release/Beta).",
        "Автоматическое завершение и очистка дублирующихся или зависших процессов при перезапуске.",
        "Сетевое разрешение последних релизов и проверка целостности файлов перед инъекцией.",
        "Полная автономность: минимальный размер и отсутствие внешних тяжелых фреймворков."
      ],
      tech: ["C++", "Win32 API", "Process Injection", "Remote Thread", "Memory Management", "CMake"],
      links: [
        { label: "GitHub: Forge", url: "https://github.com/onemorefix1337/Forge", primary: true }
      ]
    },
    {
      id: "hashgram",
      code: "03",
      title: "HashGram",
      category: "ANDROID MOD",
      subtitle: "Enhanced Telegram Client for Android",
      coords: { x: 46, y: 16, z: -26 },
      geometry: "dodecahedron",
      color: 0xffffff,
      accent: "#ffffff",
      status: "ACTIVE DEV // ANDROID",
      badge: "MOBILE TWEAK",
      summary: "Кастомная модификация официального клиента Telegram для Android с акцентом на приватность, обход ограничений и улучшение UI.",
      details: [
        "Режим скрытого номера (Anti-Leak): надежная маскировка телефонного номера в настройках и профиле от посторонних глаз.",
        "Бесконечный закреп диалогов: устранение серверного ограничения Telegram в 5/10 чатов.",
        "Снятие цензуры и обход 18+ блокировок каналов и контента.",
        "Глубокая кастомизация интерфейса: поддержка Material You / Monet иконок и кастомных шрифтов.",
        "Улучшения камеры: фиксы для dual-camera и оптимизация медиа-компонентов.",
        "Собственные скрипты автоматизации на Python для применения патчей и рефакторинга дерева проекта."
      ],
      tech: ["Java", "Android SDK", "TMessagesProj", "Python Scripting", "Gradle", "Material Design"],
      links: [
        { label: "GitHub: HashGram", url: "https://github.com/onemorefix1337/HashGram", primary: true }
      ]
    },
    {
      id: "nullcore",
      code: "04",
      title: "Nullcore Engine",
      category: "GAME TECH",
      subtitle: "Modern 3D Game Engine in C++20",
      coords: { x: 38, y: -20, z: 32 },
      geometry: "torus",
      color: 0xffffff,
      accent: "#ffffff",
      status: "OPEN SOURCE CORE",
      badge: "CO-AUTHORED",
      summary: "Модульный 3D-игровой движок, созданный с нуля на C++20 и OpenGL 4.6 совместно с разработчиком PluvCoder1337.",
      details: [
        "Entity Component System (ECS): высокопроизводительная компонентная модель на базе библиотеки EnTT.",
        "Графический пайплайн: современный OpenGL 4.6 Core Profile с собственной абстракцией RendererAPI, VAO/VBO и кастомными шейдерами.",
        "Текстурирование и ассеты: быстрая загрузка Texture2D через библиотеку stb_image.",
        "Архитектура сцен: поддержка как runtime-режима, так и расширяемой структуры для редактора сцен.",
        "Нативные скриптовые компоненты (NativeScript) для гибкого программирования логики сущностей.",
        "Кроссплатформенный потенциал и эксперименты с оптимизацией под мобильные чипсеты."
      ],
      tech: ["C++20", "OpenGL 4.6 Core", "EnTT (ECS)", "GLSL Shaders", "stb_image", "Game Engine Architecture"],
      links: [
        { label: "GitHub: nullcore", url: "https://github.com/onemorefix1337/nullcore", primary: true }
      ]
    },
    {
      id: "uplink",
      code: "05",
      title: "Uplink / Signals",
      category: "GATEWAY",
      subtitle: "Source Repositories & Contact Nodes",
      coords: { x: 0, y: 36, z: 20 },
      geometry: "cone",
      color: 0xffffff,
      accent: "#ffffff",
      status: "UPLINK_READY",
      badge: "NETWORK",
      summary: "Единый коммуникационный шлюз для клонирования репозиториев, отслеживания обновлений и контактов.",
      details: [
        "Все ключевые разработки находятся в открытом доступе на GitHub.",
        "Возможность быстрого клонирования кодовых баз через Git CLI.",
        "Открыт к обсуждению архитектуры движков, моддинга и низкоуровневых системных разработок."
      ],
      tech: ["Git", "GitHub Actions", "CI/CD", "Open Source Collaboration"],
      links: [
        { label: "GitHub: onemorefix1337", url: "https://github.com/onemorefix1337", primary: true },
        { label: "YMHub Official Site", url: "https://onemorefix1337.github.io/ymhub/" },
        { label: "Repositories Index", url: "https://github.com/onemorefix1337?tab=repositories" }
      ]
    }
  ],

  // Schematic connections (edges between nodes)
  connections: [
    { from: "core", to: "ymhub", label: "CDP / INJECTION" },
    { from: "core", to: "forge", label: "WIN32_LOADER" },
    { from: "core", to: "hashgram", label: "ANDROID_HOOK" },
    { from: "core", to: "nullcore", label: "ECS_ENGINE" },
    { from: "core", to: "uplink", label: "TELEMETRY" },
    { from: "forge", to: "ymhub", label: "PAYLOAD_INJECT" },
    { from: "nullcore", to: "uplink", label: "OPEN_SOURCE" },
    { from: "hashgram", to: "uplink", label: "RELEASE_SYNC" }
  ]
};
