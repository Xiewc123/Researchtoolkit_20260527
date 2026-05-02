export interface Era {
  name: string;
  start: number;
  end: number;
}

export interface Emperor {
  name: string;
  start: number;
  end: number;
  eras: Era[];
}

export interface Dynasty {
  name: string;
  start: number;
  end: number;
  emperors: Emperor[];
}

export const dynastyData: Dynasty[] = [
  {
    name: '西汉',
    start: -202,
    end: 8,
    emperors: [
      {
        name: '高祖刘邦',
        start: -206,
        end: -195,
        eras: [{ name: '汉高祖', start: -206, end: -195 }]
      },
      {
        name: '惠帝刘盈',
        start: -194,
        end: -188,
        eras: [{ name: '汉惠帝', start: -194, end: -188 }]
      },
      {
        name: '吕后',
        start: -187,
        end: -180,
        eras: [{ name: '高后', start: -187, end: -180 }]
      },
      {
        name: '文帝刘恒',
        start: -179,
        end: -157,
        eras: [{ name: '汉文帝', start: -179, end: -157 }]
      },
      {
        name: '景帝刘启',
        start: -156,
        end: -141,
        eras: [{ name: '汉景帝', start: -156, end: -141 }]
      },
      {
        name: '武帝刘彻',
        start: -140,
        end: -87,
        eras: [
          { name: '建元', start: -140, end: -135 },
          { name: '元光', start: -134, end: -129 },
          { name: '元朔', start: -128, end: -123 },
          { name: '元狩', start: -122, end: -117 },
          { name: '元鼎', start: -116, end: -111 },
          { name: '元封', start: -110, end: -105 },
          { name: '太初', start: -104, end: -101 },
          { name: '天汉', start: -100, end: -97 },
          { name: '太始', start: -96, end: -93 },
          { name: '征和', start: -92, end: -89 },
          { name: '后元', start: -88, end: -87 }
        ]
      },
      {
        name: '昭帝刘弗陵',
        start: -86,
        end: -74,
        eras: [
          { name: '始元', start: -86, end: -80 },
          { name: '元凤', start: -80, end: -75 },
          { name: '元平', start: -74, end: -74 }
        ]
      },
      {
        name: '宣帝刘询',
        start: -73,
        end: -49,
        eras: [
          { name: '本始', start: -73, end: -70 },
          { name: '地节', start: -69, end: -66 },
          { name: '元康', start: -65, end: -62 },
          { name: '神爵', start: -61, end: -58 },
          { name: '五凤', start: -57, end: -54 },
          { name: '甘露', start: -53, end: -50 },
          { name: '黄龙', start: -49, end: -49 }
        ]
      },
      {
        name: '元帝刘奭',
        start: -48,
        end: -33,
        eras: [
          { name: '初元', start: -48, end: -44 },
          { name: '永光', start: -43, end: -39 },
          { name: '建昭', start: -38, end: -34 },
          { name: '竟宁', start: -33, end: -33 }
        ]
      },
      {
        name: '成帝刘骜',
        start: -32,
        end: -7,
        eras: [
          { name: '建始', start: -32, end: -29 },
          { name: '河平', start: -28, end: -25 },
          { name: '阳朔', start: -24, end: -21 },
          { name: '鸿嘉', start: -20, end: -17 },
          { name: '永始', start: -16, end: -13 },
          { name: '元延', start: -12, end: -9 },
          { name: '绥和', start: -8, end: -7 }
        ]
      },
      {
        name: '哀帝刘欣',
        start: -6,
        end: -1,
        eras: [
          { name: '建平', start: -6, end: -3 },
          { name: '元寿', start: -2, end: -1 }
        ]
      },
      {
        name: '平帝刘衎',
        start: 1,
        end: 5,
        eras: [{ name: '元始', start: 1, end: 5 }]
      },
      {
        name: '孺子婴',
        start: 6,
        end: 8,
        eras: [
          { name: '居摄', start: 6, end: 8 },
          { name: '初始', start: 8, end: 8 }
        ]
      }
    ]
  },
  {
    name: '新',
    start: 9,
    end: 23,
    emperors: [
      {
        name: '王莽',
        start: 9,
        end: 23,
        eras: [
          { name: '始建国', start: 9, end: 13 },
          { name: '天凤', start: 14, end: 19 },
          { name: '地皇', start: 20, end: 23 }
        ]
      }
    ]
  },
  {
    name: '更始朝',
    start: 23,
    end: 25,
    emperors: [
      {
        name: '更始帝刘玄',
        start: 23,
        end: 25,
        eras: [{ name: '更始', start: 23, end: 25 }]
      }
    ]
  },
  {
    name: '东汉',
    start: 25,
    end: 220,
    emperors: [
      {
        name: '光武帝刘秀',
        start: 25,
        end: 57,
        eras: [
          { name: '建武', start: 25, end: 56 },
          { name: '建武中元', start: 56, end: 57 }
        ]
      },
      {
        name: '明帝刘庄',
        start: 58,
        end: 75,
        eras: [{ name: '永平', start: 58, end: 75 }]
      },
      {
        name: '章帝刘炟',
        start: 76,
        end: 88,
        eras: [
          { name: '建初', start: 76, end: 84 },
          { name: '元和', start: 84, end: 87 },
          { name: '章和', start: 87, end: 88 }
        ]
      },
      {
        name: '和帝刘肇',
        start: 89,
        end: 105,
        eras: [
          { name: '永元', start: 89, end: 105 },
          { name: '元兴', start: 105, end: 105 }
        ]
      },
      {
        name: '殇帝刘隆',
        start: 106,
        end: 106,
        eras: [{ name: '延平', start: 106, end: 106 }]
      },
      {
        name: '安帝刘祜',
        start: 107,
        end: 125,
        eras: [
          { name: '永初', start: 107, end: 113 },
          { name: '元初', start: 114, end: 120 },
          { name: '永宁', start: 120, end: 121 },
          { name: '建光', start: 121, end: 122 },
          { name: '延光', start: 122, end: 125 }
        ]
      },
      {
        name: '顺帝刘保',
        start: 126,
        end: 144,
        eras: [
          { name: '永建', start: 126, end: 132 },
          { name: '阳嘉', start: 132, end: 135 },
          { name: '永和', start: 136, end: 141 },
          { name: '汉安', start: 142, end: 144 },
          { name: '建康', start: 144, end: 144 }
        ]
      },
      {
        name: '冲帝刘炳',
        start: 145,
        end: 145,
        eras: [{ name: '永嘉', start: 145, end: 145 }]
      },
      {
        name: '质帝刘缵',
        start: 146,
        end: 146,
        eras: [{ name: '本初', start: 146, end: 146 }]
      },
      {
        name: '桓帝刘志',
        start: 147,
        end: 167,
        eras: [
          { name: '建和', start: 147, end: 149 },
          { name: '和平', start: 150, end: 150 },
          { name: '元嘉', start: 151, end: 153 },
          { name: '永兴', start: 153, end: 154 },
          { name: '永寿', start: 155, end: 158 },
          { name: '延熹', start: 158, end: 167 },
          { name: '永康', start: 167, end: 167 }
        ]
      },
      {
        name: '灵帝刘宏',
        start: 168,
        end: 189,
        eras: [
          { name: '建宁', start: 168, end: 172 },
          { name: '熹平', start: 172, end: 178 },
          { name: '光和', start: 178, end: 184 },
          { name: '中平', start: 184, end: 189 }
        ]
      },
      {
        name: '少帝刘辩',
        start: 189,
        end: 189,
        eras: [
          { name: '光熹', start: 189, end: 189 },
          { name: '昭宁', start: 189, end: 189 }
        ]
      },
      {
        name: '献帝刘协',
        start: 189,
        end: 220,
        eras: [
          { name: '永汉', start: 189, end: 189 },
          { name: '初平', start: 190, end: 193 },
          { name: '兴平', start: 194, end: 195 },
          { name: '建安', start: 196, end: 220 },
          { name: '延康', start: 220, end: 220 }
        ]
      }
    ]
  },
  {
    name: '魏',
    start: 220,
    end: 266,
    emperors: [
      {
        name: '文帝曹丕',
        start: 220,
        end: 226,
        eras: [{ name: '黄初', start: 220, end: 226 }]
      },
      {
        name: '明帝曹叡',
        start: 227,
        end: 239,
        eras: [
          { name: '太和', start: 227, end: 233 },
          { name: '青龙', start: 233, end: 237 },
          { name: '景初', start: 237, end: 239 }
        ]
      },
      {
        name: '齐王曹芳',
        start: 240,
        end: 254,
        eras: [
          { name: '正始', start: 240, end: 249 },
          { name: '嘉平', start: 249, end: 254 }
        ]
      },
      {
        name: '高贵乡公曹髦',
        start: 254,
        end: 260,
        eras: [
          { name: '正元', start: 254, end: 256 },
          { name: '甘露', start: 256, end: 260 }
        ]
      },
      {
        name: '元帝曹奂',
        start: 260,
        end: 266,
        eras: [
          { name: '景元', start: 260, end: 264 },
          { name: '咸熙', start: 264, end: 266 }
        ]
      }
    ]
  },
  {
    name: '蜀',
    start: 221,
    end: 263,
    emperors: [
      {
        name: '昭烈帝刘备',
        start: 221,
        end: 223,
        eras: [{ name: '章武', start: 221, end: 223 }]
      },
      {
        name: '后主刘禅',
        start: 223,
        end: 263,
        eras: [
          { name: '建兴', start: 223, end: 237 },
          { name: '延熙', start: 238, end: 257 },
          { name: '景耀', start: 258, end: 263 },
          { name: '炎兴', start: 263, end: 263 }
        ]
      }
    ]
  },
  {
    name: '吴',
    start: 222,
    end: 280,
    emperors: [
      {
        name: '大帝孙权',
        start: 222,
        end: 252,
        eras: [
          { name: '黄武', start: 222, end: 229 },
          { name: '黄龙', start: 229, end: 231 },
          { name: '嘉禾', start: 232, end: 238 },
          { name: '赤烏', start: 238, end: 251 },
          { name: '太元', start: 251, end: 252 },
          { name: '神凤', start: 252, end: 252 }
        ]
      },
      {
        name: '废帝孙亮',
        start: 252,
        end: 258,
        eras: [
          { name: '建兴', start: 252, end: 253 },
          { name: '五凤', start: 254, end: 256 },
          { name: '太平', start: 256, end: 258 }
        ]
      },
      {
        name: '景帝孙休',
        start: 258,
        end: 264,
        eras: [{ name: '永安', start: 258, end: 264 }]
      },
      {
        name: '末帝孙皓',
        start: 264,
        end: 280,
        eras: [
          { name: '元兴', start: 264, end: 265 },
          { name: '甘露', start: 265, end: 266 },
          { name: '宝鼎', start: 266, end: 269 },
          { name: '建衡', start: 269, end: 271 },
          { name: '凤凰', start: 272, end: 274 },
          { name: '天册', start: 275, end: 276 },
          { name: '天玺', start: 276, end: 276 },
          { name: '天纪', start: 277, end: 280 }
        ]
      }
    ]
  },
  {
    name: '西晋',
    start: 266,
    end: 316,
    emperors: [
      {
        name: '武帝司马炎',
        start: 266,
        end: 290,
        eras: [
          { name: '泰始', start: 266, end: 274 },
          { name: '咸宁', start: 275, end: 280 },
          { name: '太康', start: 280, end: 289 },
          { name: '太熙', start: 290, end: 290 }
        ]
      },
      {
        name: '惠帝司马衷',
        start: 290,
        end: 306,
        eras: [
          { name: '永熙', start: 290, end: 291 },
          { name: '永平', start: 291, end: 291 },
          { name: '元康', start: 291, end: 299 },
          { name: '永康', start: 300, end: 301 },
          { name: '永宁', start: 301, end: 302 },
          { name: '太安', start: 302, end: 303 },
          { name: '永安', start: 304, end: 304 },
          { name: '建武', start: 304, end: 304 },
          { name: '永兴', start: 304, end: 306 },
          { name: '光熙', start: 306, end: 306 }
        ]
      },
      {
        name: '怀帝司马炽',
        start: 307,
        end: 313,
        eras: [{ name: '永嘉', start: 307, end: 313 }]
      },
      {
        name: '愍帝司马邺',
        start: 313,
        end: 316,
        eras: [{ name: '建兴', start: 313, end: 316 }]
      }
    ]
  },
  {
    name: '东晋',
    start: 317,
    end: 420,
    emperors: [
      {
        name: '元帝司马睿',
        start: 317,
        end: 323,
        eras: [
          { name: '建武', start: 317, end: 318 },
          { name: '太兴', start: 318, end: 321 },
          { name: '永昌', start: 322, end: 323 }
        ]
      },
      {
        name: '明帝司马绍',
        start: 323,
        end: 326,
        eras: [{ name: '太宁', start: 323, end: 326 }]
      },
      {
        name: '成帝司马衍',
        start: 326,
        end: 342,
        eras: [
          { name: '咸和', start: 326, end: 334 },
          { name: '咸康', start: 335, end: 342 }
        ]
      },
      {
        name: '康帝司马岳',
        start: 343,
        end: 344,
        eras: [{ name: '建元', start: 343, end: 344 }]
      },
      {
        name: '穆帝司马聃',
        start: 345,
        end: 361,
        eras: [
          { name: '永和', start: 345, end: 356 },
          { name: '升平', start: 357, end: 361 }
        ]
      },
      {
        name: '哀帝司马丕',
        start: 362,
        end: 365,
        eras: [
          { name: '隆和', start: 362, end: 363 },
          { name: '兴宁', start: 363, end: 365 }
        ]
      },
      {
        name: '废帝司马奕',
        start: 366,
        end: 371,
        eras: [{ name: '太和', start: 366, end: 371 }]
      },
      {
        name: '简文帝司马昱',
        start: 371,
        end: 372,
        eras: [{ name: '咸安', start: 371, end: 372 }]
      },
      {
        name: '孝武帝司马曜',
        start: 373,
        end: 396,
        eras: [
          { name: '宁康', start: 373, end: 375 },
          { name: '太元', start: 376, end: 396 }
        ]
      },
      {
        name: '安帝司马德宗',
        start: 397,
        end: 418,
        eras: [
          { name: '隆安', start: 397, end: 401 },
          { name: '元兴', start: 402, end: 404 },
          { name: '义熙', start: 405, end: 418 }
        ]
      },
      {
        name: '恭帝司马德文',
        start: 419,
        end: 420,
        eras: [{ name: '元熙', start: 419, end: 420 }]
      }
    ]
  },
  {
    name: '前宋',
    start: 420,
    end: 479,
    emperors: [
      {
        name: '武帝刘裕',
        start: 420,
        end: 422,
        eras: [{ name: '永初', start: 420, end: 422 }]
      },
      {
        name: '少帝刘义符',
        start: 423,
        end: 424,
        eras: [{ name: '景平', start: 423, end: 424 }]
      },
      {
        name: '文帝刘义隆',
        start: 424,
        end: 453,
        eras: [{ name: '元嘉', start: 424, end: 453 }]
      },
      {
        name: '孝武帝刘骏',
        start: 454,
        end: 464,
        eras: [
          { name: '孝建', start: 454, end: 456 },
          { name: '大明', start: 457, end: 464 }
        ]
      },
      {
        name: '前废帝刘子业',
        start: 465,
        end: 465,
        eras: [
          { name: '永光', start: 465, end: 465 },
          { name: '景和', start: 465, end: 465 }
        ]
      },
      {
        name: '明帝刘彧',
        start: 465,
        end: 472,
        eras: [
          { name: '泰始', start: 465, end: 471 },
          { name: '泰豫', start: 472, end: 472 }
        ]
      },
      {
        name: '后废帝刘昱',
        start: 473,
        end: 477,
        eras: [{ name: '元徽', start: 473, end: 477 }]
      },
      {
        name: '顺帝刘准',
        start: 477,
        end: 479,
        eras: [{ name: '升明', start: 477, end: 479 }]
      }
    ]
  },
  {
    name: '南齐',
    start: 479,
    end: 502,
    emperors: [
      {
        name: '高帝萧道成',
        start: 479,
        end: 482,
        eras: [{ name: '建元', start: 479, end: 482 }]
      },
      {
        name: '武帝萧赜',
        start: 483,
        end: 493,
        eras: [{ name: '永明', start: 483, end: 493 }]
      },
      {
        name: '郁林王萧昭业',
        start: 494,
        end: 494,
        eras: [{ name: '隆昌', start: 494, end: 494 }]
      },
      {
        name: '海陵王萧昭文',
        start: 494,
        end: 494,
        eras: [{ name: '延兴', start: 494, end: 494 }]
      },
      {
        name: '明帝萧鸾',
        start: 494,
        end: 498,
        eras: [
          { name: '建武', start: 494, end: 498 },
          { name: '永泰', start: 498, end: 498 }
        ]
      },
      {
        name: '东昏侯萧宝卷',
        start: 499,
        end: 501,
        eras: [{ name: '永元', start: 499, end: 501 }]
      },
      {
        name: '和帝萧宝融',
        start: 501,
        end: 502,
        eras: [{ name: '中兴', start: 501, end: 502 }]
      }
    ]
  },
  {
    name: '南梁',
    start: 502,
    end: 557,
    emperors: [
      {
        name: '武帝萧衍',
        start: 502,
        end: 549,
        eras: [
          { name: '天监', start: 502, end: 519 },
          { name: '普通', start: 520, end: 527 },
          { name: '大通', start: 527, end: 529 },
          { name: '中大通', start: 529, end: 534 },
          { name: '大同', start: 535, end: 546 },
          { name: '中大同', start: 546, end: 547 },
          { name: '太清', start: 547, end: 549 }
        ]
      },
      {
        name: '简文帝萧纲',
        start: 550,
        end: 551,
        eras: [{ name: '大宝', start: 550, end: 551 }]
      },
      {
        name: '元帝萧绎',
        start: 552,
        end: 555,
        eras: [{ name: '承圣', start: 552, end: 555 }]
      },
      {
        name: '贞阳侯萧渊明',
        start: 555,
        end: 555,
        eras: [{ name: '天成', start: 555, end: 555 }]
      },
      {
        name: '敬帝萧方智',
        start: 555,
        end: 557,
        eras: [
          { name: '绍泰', start: 555, end: 556 },
          { name: '太平', start: 556, end: 557 }
        ]
      }
    ]
  },
  {
    name: '陈',
    start: 557,
    end: 589,
    emperors: [
      {
        name: '武帝陈霸先',
        start: 557,
        end: 559,
        eras: [{ name: '永定', start: 557, end: 559 }]
      },
      {
        name: '文帝陈蒨',
        start: 560,
        end: 566,
        eras: [
          { name: '天嘉', start: 560, end: 566 },
          { name: '天康', start: 566, end: 566 }
        ]
      },
      {
        name: '废帝陈伯宗',
        start: 567,
        end: 568,
        eras: [{ name: '光大', start: 567, end: 568 }]
      },
      {
        name: '宣帝陈顼',
        start: 569,
        end: 582,
        eras: [{ name: '太建', start: 569, end: 582 }]
      },
      {
        name: '后主陈叔宝',
        start: 583,
        end: 589,
        eras: [
          { name: '至德', start: 583, end: 586 },
          { name: '祯明', start: 587, end: 589 }
        ]
      }
    ]
  },
  {
    name: '北魏',
    start: 386,
    end: 534,
    emperors: [
      {
        name: '道武帝拓跋珪',
        start: 386,
        end: 409,
        eras: [
          { name: '登国', start: 386, end: 396 },
          { name: '皇始', start: 396, end: 398 },
          { name: '天兴', start: 398, end: 404 },
          { name: '天赐', start: 404, end: 409 }
        ]
      },
      {
        name: '明元帝拓跋嗣',
        start: 409,
        end: 423,
        eras: [
          { name: '永兴', start: 409, end: 413 },
          { name: '神瑞', start: 414, end: 416 },
          { name: '泰常', start: 416, end: 423 }
        ]
      },
      {
        name: '太武帝拓跋焘',
        start: 424,
        end: 452,
        eras: [
          { name: '始光', start: 424, end: 428 },
          { name: '神䴥', start: 428, end: 431 },
          { name: '延和', start: 432, end: 434 },
          { name: '太延', start: 435, end: 440 },
          { name: '太平真君', start: 440, end: 451 },
          { name: '正平', start: 451, end: 452 }
        ]
      },
      {
        name: '文成帝拓跋濬',
        start: 452,
        end: 465,
        eras: [
          { name: '兴安', start: 452, end: 454 },
          { name: '兴光', start: 454, end: 455 },
          { name: '太安', start: 455, end: 459 },
          { name: '和平', start: 460, end: 465 }
        ]
      },
      {
        name: '献文帝拓跋弘',
        start: 466,
        end: 471,
        eras: [
          { name: '天安', start: 466, end: 467 },
          { name: '皇兴', start: 467, end: 471 }
        ]
      },
      {
        name: '孝文帝元宏',
        start: 471,
        end: 499,
        eras: [
          { name: '延兴', start: 471, end: 476 },
          { name: '承明', start: 476, end: 476 },
          { name: '太和', start: 477, end: 499 }
        ]
      },
      {
        name: '宣武帝元恪',
        start: 500,
        end: 515,
        eras: [
          { name: '景明', start: 500, end: 503 },
          { name: '正始', start: 504, end: 508 },
          { name: '永平', start: 508, end: 512 },
          { name: '延昌', start: 512, end: 515 }
        ]
      },
      {
        name: '孝明帝元诩',
        start: 516,
        end: 528,
        eras: [
          { name: '熙平', start: 516, end: 518 },
          { name: '神龟', start: 518, end: 520 },
          { name: '正光', start: 520, end: 525 },
          { name: '孝昌', start: 525, end: 527 },
          { name: '武泰', start: 528, end: 528 }
        ]
      },
      {
        name: '孝庄帝元子攸',
        start: 528,
        end: 530,
        eras: [
          { name: '建义', start: 528, end: 528 },
          { name: '永安', start: 528, end: 530 }
        ]
      },
      {
        name: '节闵帝元恭',
        start: 531,
        end: 532,
        eras: [{ name: '普泰', start: 531, end: 532 }]
      },
      {
        name: '安定王元朗',
        start: 531,
        end: 532,
        eras: [{ name: '中兴', start: 531, end: 532 }]
      },
      {
        name: '孝武帝元修',
        start: 532,
        end: 534,
        eras: [
          { name: '太昌', start: 532, end: 532 },
          { name: '永兴', start: 532, end: 532 },
          { name: '永熙', start: 532, end: 534 }
        ]
      }
    ]
  },
  {
    name: '西魏',
    start: 535,
    end: 556,
    emperors: [
      {
        name: '文帝元宝炬',
        start: 535,
        end: 551,
        eras: [{ name: '大统', start: 535, end: 551 }]
      },
      {
        name: '废帝元钦',
        start: 552,
        end: 554,
        eras: [{ name: '废帝', start: 552, end: 554 }]
      },
      {
        name: '恭帝拓跋邈',
        start: 554,
        end: 556,
        eras: [{ name: '恭帝', start: 554, end: 556 }]
      }
    ]
  },
  {
    name: '东魏',
    start: 534,
    end: 550,
    emperors: [
      {
        name: '孝静帝元善见',
        start: 534,
        end: 550,
        eras: [
          { name: '天平', start: 534, end: 537 },
          { name: '元象', start: 538, end: 539 },
          { name: '兴和', start: 539, end: 542 },
          { name: '武定', start: 543, end: 550 }
        ]
      }
    ]
  },
  {
    name: '北齐',
    start: 550,
    end: 577,
    emperors: [
      {
        name: '文宣帝高洋',
        start: 550,
        end: 559,
        eras: [{ name: '天保', start: 550, end: 559 }]
      },
      {
        name: '废帝高殷',
        start: 560,
        end: 560,
        eras: [{ name: '乾明', start: 560, end: 560 }]
      },
      {
        name: '孝昭帝高演',
        start: 560,
        end: 561,
        eras: [{ name: '皇建', start: 560, end: 561 }]
      },
      {
        name: '武成帝高湛',
        start: 562,
        end: 565,
        eras: [{ name: '河清', start: 562, end: 565 }]
      },
      {
        name: '后主高纬',
        start: 565,
        end: 576,
        eras: [
          { name: '天统', start: 565, end: 569 },
          { name: '武平', start: 570, end: 576 },
          { name: '隆化', start: 576, end: 576 }
        ]
      },
      {
        name: '幼主高恒',
        start: 577,
        end: 577,
        eras: [{ name: '承光', start: 577, end: 577 }]
      }
    ]
  },
  {
    name: '北周',
    start: 557,
    end: 581,
    emperors: [
      {
        name: '明帝宇文毓',
        start: 559,
        end: 560,
        eras: [{ name: '武成', start: 559, end: 560 }]
      },
      {
        name: '武帝宇文邕',
        start: 561,
        end: 578,
        eras: [
          { name: '保定', start: 561, end: 565 },
          { name: '天和', start: 566, end: 572 },
          { name: '建德', start: 572, end: 578 },
          { name: '宣政', start: 578, end: 578 }
        ]
      },
      {
        name: '宣帝宇文赟',
        start: 579,
        end: 579,
        eras: [{ name: '大成', start: 579, end: 579 }]
      },
      {
        name: '静帝宇文阐',
        start: 579,
        end: 581,
        eras: [
          { name: '大象', start: 579, end: 580 },
          { name: '大定', start: 581, end: 581 }
        ]
      }
    ]
  },
  {
    name: '隋',
    start: 581,
    end: 618,
    emperors: [
      {
        name: '文帝杨坚',
        start: 581,
        end: 604,
        eras: [
          { name: '开皇', start: 581, end: 600 },
          { name: '仁寿', start: 601, end: 604 }
        ]
      },
      {
        name: '炀帝杨广',
        start: 605,
        end: 618,
        eras: [{ name: '大业', start: 605, end: 618 }]
      },
      {
        name: '恭帝杨侑',
        start: 617,
        end: 618,
        eras: [{ name: '义宁', start: 617, end: 618 }]
      }
    ]
  },
  {
    name: '唐',
    start: 618,
    end: 907,
    emperors: [
      {
        name: '高祖李渊',
        start: 618,
        end: 626,
        eras: [{ name: '武德', start: 618, end: 626 }]
      },
      {
        name: '太宗李世民',
        start: 627,
        end: 649,
        eras: [{ name: '贞观', start: 627, end: 649 }]
      },
      {
        name: '高宗李治',
        start: 650,
        end: 683,
        eras: [
          { name: '永徽', start: 650, end: 655 },
          { name: '显庆', start: 656, end: 661 },
          { name: '龙朔', start: 661, end: 663 },
          { name: '麟德', start: 664, end: 665 },
          { name: '乾封', start: 666, end: 668 },
          { name: '总章', start: 668, end: 670 },
          { name: '咸亨', start: 670, end: 674 },
          { name: '上元', start: 674, end: 676 },
          { name: '仪凤', start: 676, end: 679 },
          { name: '调露', start: 679, end: 680 },
          { name: '永隆', start: 680, end: 681 },
          { name: '开耀', start: 681, end: 682 },
          { name: '永淳', start: 682, end: 683 },
          { name: '弘道', start: 683, end: 683 }
        ]
      },
      {
        name: '中宗李显',
        start: 684,
        end: 684,
        eras: [{ name: '嗣圣', start: 684, end: 684 }]
      },
      {
        name: '睿宗李旦',
        start: 684,
        end: 690,
        eras: [
          { name: '文明', start: 684, end: 684 },
          { name: '光宅', start: 684, end: 684 },
          { name: '垂拱', start: 685, end: 688 },
          { name: '永昌', start: 689, end: 689 },
          { name: '载初', start: 689, end: 690 }
        ]
      },
      {
        name: '武则天',
        start: 690,
        end: 705,
        eras: [
          { name: '天授', start: 690, end: 692 },
          { name: '如意', start: 692, end: 692 },
          { name: '长寿', start: 692, end: 694 },
          { name: '延载', start: 694, end: 694 },
          { name: '证圣', start: 695, end: 695 },
          { name: '天册万岁', start: 695, end: 695 },
          { name: '万岁登封', start: 695, end: 696 },
          { name: '万岁通天', start: 696, end: 697 },
          { name: '神功', start: 697, end: 697 },
          { name: '圣历', start: 698, end: 700 },
          { name: '久视', start: 700, end: 701 },
          { name: '大足', start: 701, end: 701 },
          { name: '长安', start: 701, end: 705 }
        ]
      },
      {
        name: '中宗李显（复位）',
        start: 705,
        end: 710,
        eras: [
          { name: '神龙', start: 705, end: 707 },
          { name: '景龙', start: 707, end: 710 }
        ]
      },
      {
        name: '殇帝李重茂',
        start: 710,
        end: 710,
        eras: [{ name: '唐隆', start: 710, end: 710 }]
      },
      {
        name: '睿宗李旦（复位）',
        start: 710,
        end: 712,
        eras: [
          { name: '景云', start: 710, end: 711 },
          { name: '太极', start: 712, end: 712 },
          { name: '延和', start: 712, end: 712 }
        ]
      },
      {
        name: '玄宗李隆基',
        start: 712,
        end: 756,
        eras: [
          { name: '先天', start: 712, end: 713 },
          { name: '开元', start: 713, end: 741 },
          { name: '天宝', start: 742, end: 756 }
        ]
      },
      {
        name: '肃宗李亨',
        start: 756,
        end: 761,
        eras: [
          { name: '至德', start: 756, end: 758 },
          { name: '乾元', start: 758, end: 760 },
          { name: '上元', start: 760, end: 761 }
        ]
      },
      {
        name: '代宗李豫',
        start: 762,
        end: 779,
        eras: [
          { name: '宝应', start: 762, end: 763 },
          { name: '广德', start: 763, end: 764 },
          { name: '永泰', start: 765, end: 766 },
          { name: '大历', start: 766, end: 779 }
        ]
      },
      {
        name: '德宗李适',
        start: 780,
        end: 805,
        eras: [
          { name: '建中', start: 780, end: 783 },
          { name: '兴元', start: 784, end: 784 },
          { name: '贞元', start: 785, end: 805 }
        ]
      },
      {
        name: '顺宗李诵',
        start: 805,
        end: 805,
        eras: [{ name: '永贞', start: 805, end: 805 }]
      },
      {
        name: '宪宗李纯',
        start: 806,
        end: 820,
        eras: [{ name: '元和', start: 806, end: 820 }]
      },
      {
        name: '穆宗李恒',
        start: 821,
        end: 824,
        eras: [{ name: '长庆', start: 821, end: 824 }]
      },
      {
        name: '敬宗李湛',
        start: 825,
        end: 827,
        eras: [{ name: '宝历', start: 825, end: 827 }]
      },
      {
        name: '文宗李昂',
        start: 827,
        end: 840,
        eras: [
          { name: '大和', start: 827, end: 835 },
          { name: '开成', start: 836, end: 840 }
        ]
      },
      {
        name: '武宗李炎',
        start: 841,
        end: 846,
        eras: [{ name: '会昌', start: 841, end: 846 }]
      },
      {
        name: '宣宗李忱',
        start: 847,
        end: 860,
        eras: [{ name: '大中', start: 847, end: 860 }]
      },
      {
        name: '懿宗李漼',
        start: 860,
        end: 874,
        eras: [{ name: '咸通', start: 860, end: 874 }]
      },
      {
        name: '僖宗李儇',
        start: 874,
        end: 888,
        eras: [
          { name: '乾符', start: 874, end: 879 },
          { name: '广明', start: 880, end: 881 },
          { name: '中和', start: 881, end: 885 },
          { name: '光启', start: 885, end: 888 },
          { name: '文德', start: 888, end: 888 }
        ]
      },
      {
        name: '昭宗李晔',
        start: 889,
        end: 904,
        eras: [
          { name: '龙纪', start: 889, end: 889 },
          { name: '大顺', start: 890, end: 891 },
          { name: '景福', start: 892, end: 893 },
          { name: '乾宁', start: 894, end: 898 },
          { name: '光化', start: 898, end: 901 },
          { name: '天复', start: 901, end: 904 }
        ]
      },
      {
        name: '哀帝李柷',
        start: 904,
        end: 907,
        eras: [{ name: '天祐', start: 904, end: 907 }]
      }
    ]
  },
  {
    name: '后梁',
    start: 907,
    end: 923,
    emperors: [
      {
        name: '太祖朱温',
        start: 907,
        end: 915,
        eras: [
          { name: '开平', start: 907, end: 911 },
          { name: '乾化', start: 911, end: 915 }
        ]
      },
      {
        name: '末帝朱友贞',
        start: 915,
        end: 923,
        eras: [
          { name: '贞明', start: 915, end: 921 },
          { name: '龙德', start: 921, end: 923 }
        ]
      }
    ]
  },
  {
    name: '后唐',
    start: 923,
    end: 936,
    emperors: [
      {
        name: '庄宗李存勖',
        start: 923,
        end: 926,
        eras: [{ name: '同光', start: 923, end: 926 }]
      },
      {
        name: '明宗李嗣源',
        start: 926,
        end: 933,
        eras: [
          { name: '天成', start: 926, end: 930 },
          { name: '长兴', start: 930, end: 933 }
        ]
      },
      {
        name: '闵帝李从厚',
        start: 934,
        end: 934,
        eras: [{ name: '应顺', start: 934, end: 934 }]
      },
      {
        name: '末帝李从珂',
        start: 934,
        end: 936,
        eras: [{ name: '清泰', start: 934, end: 936 }]
      }
    ]
  },
  {
    name: '后晋',
    start: 936,
    end: 947,
    emperors: [
      {
        name: '高祖石敬瑭',
        start: 936,
        end: 944,
        eras: [{ name: '天福', start: 936, end: 944 }]
      },
      {
        name: '出帝石重贵',
        start: 944,
        end: 947,
        eras: [{ name: '开运', start: 944, end: 947 }]
      }
    ]
  },
  {
    name: '后汉',
    start: 947,
    end: 950,
    emperors: [
      {
        name: '高祖刘知远',
        start: 947,
        end: 947,
        eras: [{ name: '天福', start: 947, end: 947 }]
      },
      {
        name: '隐帝刘承祐',
        start: 948,
        end: 950,
        eras: [{ name: '乾祐', start: 948, end: 950 }]
      }
    ]
  },
  {
    name: '后周',
    start: 951,
    end: 960,
    emperors: [
      {
        name: '太祖郭威',
        start: 951,
        end: 953,
        eras: [{ name: '广顺', start: 951, end: 953 }]
      },
      {
        name: '世宗柴荣',
        start: 954,
        end: 960,
        eras: [{ name: '显德', start: 954, end: 960 }]
      }
    ]
  },
  {
    name: '宋',
    start: 960,
    end: 1279,
    emperors: [
      {
        name: '太祖赵匡胤',
        start: 960,
        end: 976,
        eras: [
          { name: '建隆', start: 960, end: 963 },
          { name: '乾德', start: 963, end: 968 },
          { name: '开宝', start: 968, end: 976 }
        ]
      },
      {
        name: '太宗赵光义',
        start: 976,
        end: 997,
        eras: [
          { name: '太平兴国', start: 976, end: 984 },
          { name: '雍熙', start: 984, end: 987 },
          { name: '端拱', start: 988, end: 989 },
          { name: '淳化', start: 990, end: 994 },
          { name: '至道', start: 995, end: 997 }
        ]
      },
      {
        name: '真宗赵恒',
        start: 998,
        end: 1022,
        eras: [
          { name: '咸平', start: 998, end: 1003 },
          { name: '景德', start: 1004, end: 1007 },
          { name: '大中祥符', start: 1008, end: 1016 },
          { name: '天禧', start: 1017, end: 1021 },
          { name: '乾兴', start: 1022, end: 1022 }
        ]
      },
      {
        name: '仁宗赵祯',
        start: 1023,
        end: 1063,
        eras: [
          { name: '天圣', start: 1023, end: 1032 },
          { name: '明道', start: 1032, end: 1033 },
          { name: '景祐', start: 1034, end: 1038 },
          { name: '宝元', start: 1038, end: 1040 },
          { name: '康定', start: 1040, end: 1041 },
          { name: '庆历', start: 1041, end: 1048 },
          { name: '皇祐', start: 1049, end: 1054 },
          { name: '至和', start: 1054, end: 1056 },
          { name: '嘉祐', start: 1056, end: 1063 }
        ]
      },
      {
        name: '英宗赵曙',
        start: 1064,
        end: 1067,
        eras: [{ name: '治平', start: 1064, end: 1067 }]
      },
      {
        name: '神宗赵顼',
        start: 1068,
        end: 1085,
        eras: [
          { name: '熙宁', start: 1068, end: 1077 },
          { name: '元丰', start: 1078, end: 1085 }
        ]
      },
      {
        name: '哲宗赵煦',
        start: 1086,
        end: 1100,
        eras: [
          { name: '元祐', start: 1086, end: 1094 },
          { name: '绍圣', start: 1094, end: 1098 },
          { name: '元符', start: 1098, end: 1100 }
        ]
      },
      {
        name: '徽宗赵佶',
        start: 1101,
        end: 1125,
        eras: [
          { name: '建中靖国', start: 1101, end: 1101 },
          { name: '崇宁', start: 1102, end: 1106 },
          { name: '大观', start: 1107, end: 1110 },
          { name: '政和', start: 1111, end: 1118 },
          { name: '重和', start: 1118, end: 1119 },
          { name: '宣和', start: 1119, end: 1125 }
        ]
      },
      {
        name: '钦宗赵桓',
        start: 1126,
        end: 1127,
        eras: [{ name: '靖康', start: 1126, end: 1127 }]
      },
      {
        name: '高宗赵构',
        start: 1127,
        end: 1162,
        eras: [
          { name: '建炎', start: 1127, end: 1130 },
          { name: '绍兴', start: 1131, end: 1162 }
        ]
      },
      {
        name: '孝宗赵昚',
        start: 1163,
        end: 1189,
        eras: [
          { name: '隆兴', start: 1163, end: 1164 },
          { name: '乾道', start: 1165, end: 1173 },
          { name: '淳熙', start: 1174, end: 1189 }
        ]
      },
      {
        name: '光宗赵惇',
        start: 1190,
        end: 1194,
        eras: [{ name: '绍熙', start: 1190, end: 1194 }]
      },
      {
        name: '宁宗赵扩',
        start: 1195,
        end: 1224,
        eras: [
          { name: '庆元', start: 1195, end: 1200 },
          { name: '嘉泰', start: 1201, end: 1204 },
          { name: '开禧', start: 1205, end: 1207 },
          { name: '嘉定', start: 1208, end: 1224 }
        ]
      },
      {
        name: '理宗赵昀',
        start: 1225,
        end: 1264,
        eras: [
          { name: '宝庆', start: 1225, end: 1227 },
          { name: '绍定', start: 1228, end: 1233 },
          { name: '端平', start: 1234, end: 1236 },
          { name: '嘉熙', start: 1237, end: 1240 },
          { name: '淳祐', start: 1241, end: 1252 },
          { name: '宝祐', start: 1253, end: 1258 },
          { name: '开庆', start: 1259, end: 1259 },
          { name: '景定', start: 1260, end: 1264 }
        ]
      },
      {
        name: '度宗赵禥',
        start: 1265,
        end: 1274,
        eras: [{ name: '咸淳', start: 1265, end: 1274 }]
      },
      {
        name: '恭帝赵㬎',
        start: 1275,
        end: 1276,
        eras: [{ name: '德祐', start: 1275, end: 1276 }]
      },
      {
        name: '端宗赵昰',
        start: 1276,
        end: 1278,
        eras: [{ name: '景炎', start: 1276, end: 1278 }]
      },
      {
        name: '怀宗赵昺',
        start: 1278,
        end: 1279,
        eras: [{ name: '祥兴', start: 1278, end: 1279 }]
      }
    ]
  },
  {
    name: '辽',
    start: 907,
    end: 1125,
    emperors: [
      {
        name: '太祖耶律阿保机',
        start: 916,
        end: 926,
        eras: [
          { name: '神册', start: 916, end: 922 },
          { name: '天赞', start: 922, end: 926 },
          { name: '天显', start: 926, end: 938 }
        ]
      },
      {
        name: '太宗耶律德光',
        start: 938,
        end: 947,
        eras: [
          { name: '会同', start: 938, end: 947 },
          { name: '大同', start: 947, end: 947 }
        ]
      },
      {
        name: '世宗耶律阮',
        start: 947,
        end: 951,
        eras: [{ name: '天禄', start: 947, end: 951 }]
      },
      {
        name: '穆宗耶律璟',
        start: 951,
        end: 969,
        eras: [{ name: '应历', start: 951, end: 969 }]
      },
      {
        name: '景宗耶律贤',
        start: 969,
        end: 983,
        eras: [
          { name: '保宁', start: 969, end: 979 },
          { name: '乾亨', start: 979, end: 983 }
        ]
      },
      {
        name: '圣宗耶律隆绪',
        start: 983,
        end: 1031,
        eras: [
          { name: '统和', start: 983, end: 1012 },
          { name: '开泰', start: 1012, end: 1021 },
          { name: '太平', start: 1021, end: 1031 }
        ]
      },
      {
        name: '兴宗耶律宗真',
        start: 1031,
        end: 1055,
        eras: [
          { name: '景福', start: 1031, end: 1032 },
          { name: '重熙', start: 1032, end: 1055 }
        ]
      },
      {
        name: '道宗耶律洪基',
        start: 1055,
        end: 1101,
        eras: [
          { name: '清宁', start: 1055, end: 1064 },
          { name: '咸雍', start: 1065, end: 1074 },
          { name: '太康', start: 1075, end: 1084 },
          { name: '大安', start: 1085, end: 1094 },
          { name: '寿昌', start: 1095, end: 1101 }
        ]
      },
      {
        name: '天祚帝耶律延禧',
        start: 1101,
        end: 1125,
        eras: [
          { name: '乾统', start: 1101, end: 1110 },
          { name: '天庆', start: 1111, end: 1120 },
          { name: '保大', start: 1121, end: 1125 }
        ]
      }
    ]
  },
  {
    name: '金',
    start: 1115,
    end: 1234,
    emperors: [
      {
        name: '太祖完颜阿骨打',
        start: 1115,
        end: 1123,
        eras: [
          { name: '收国', start: 1115, end: 1116 },
          { name: '天辅', start: 1117, end: 1123 }
        ]
      },
      {
        name: '太宗完颜吴乞买',
        start: 1123,
        end: 1137,
        eras: [{ name: '天会', start: 1123, end: 1137 }]
      },
      {
        name: '熙宗完颜亶',
        start: 1138,
        end: 1149,
        eras: [
          { name: '天眷', start: 1138, end: 1140 },
          { name: '皇统', start: 1141, end: 1149 }
        ]
      },
      {
        name: '海陵王完颜亮',
        start: 1149,
        end: 1161,
        eras: [
          { name: '天德', start: 1149, end: 1153 },
          { name: '贞元', start: 1153, end: 1156 },
          { name: '正隆', start: 1156, end: 1161 }
        ]
      },
      {
        name: '世宗完颜雍',
        start: 1161,
        end: 1189,
        eras: [{ name: '大定', start: 1161, end: 1189 }]
      },
      {
        name: '章宗完颜璟',
        start: 1190,
        end: 1208,
        eras: [
          { name: '明昌', start: 1190, end: 1196 },
          { name: '承安', start: 1196, end: 1200 },
          { name: '泰和', start: 1201, end: 1208 }
        ]
      },
      {
        name: '卫绍王完颜永济',
        start: 1209,
        end: 1213,
        eras: [
          { name: '大安', start: 1209, end: 1211 },
          { name: '崇庆', start: 1212, end: 1213 },
          { name: '至宁', start: 1213, end: 1213 }
        ]
      },
      {
        name: '宣宗完颜珣',
        start: 1213,
        end: 1223,
        eras: [
          { name: '贞祐', start: 1213, end: 1217 },
          { name: '兴定', start: 1217, end: 1222 },
          { name: '元光', start: 1222, end: 1223 }
        ]
      },
      {
        name: '哀宗完颜守绪',
        start: 1224,
        end: 1234,
        eras: [
          { name: '正大', start: 1224, end: 1231 },
          { name: '开兴', start: 1232, end: 1232 },
          { name: '天兴', start: 1232, end: 1234 }
        ]
      }
    ]
  },
  {
    name: '元',
    start: 1271,
    end: 1368,
    emperors: [
      {
        name: '世祖忽必烈',
        start: 1260,
        end: 1294,
        eras: [
          { name: '中统', start: 1260, end: 1264 },
          { name: '至元', start: 1264, end: 1294 }
        ]
      },
      {
        name: '成宗铁穆耳',
        start: 1295,
        end: 1307,
        eras: [
          { name: '元贞', start: 1295, end: 1297 },
          { name: '大德', start: 1297, end: 1307 }
        ]
      },
      {
        name: '武宗海山',
        start: 1308,
        end: 1311,
        eras: [{ name: '至大', start: 1308, end: 1311 }]
      },
      {
        name: '仁宗爱育黎拔力八达',
        start: 1312,
        end: 1320,
        eras: [
          { name: '皇庆', start: 1312, end: 1313 },
          { name: '延祐', start: 1314, end: 1320 }
        ]
      },
      {
        name: '英宗硕德八剌',
        start: 1321,
        end: 1323,
        eras: [{ name: '至治', start: 1321, end: 1323 }]
      },
      {
        name: '泰定帝也孙铁木儿',
        start: 1324,
        end: 1328,
        eras: [
          { name: '泰定', start: 1324, end: 1328 },
          { name: '致和', start: 1328, end: 1328 }
        ]
      },
      {
        name: '天顺帝阿速吉八',
        start: 1328,
        end: 1328,
        eras: [{ name: '天顺', start: 1328, end: 1328 }]
      },
      {
        name: '文宗图帖睦尔',
        start: 1328,
        end: 1330,
        eras: [{ name: '天历', start: 1328, end: 1330 }]
      },
      {
        name: '文宗/宁宗',
        start: 1330,
        end: 1333,
        eras: [{ name: '至顺', start: 1330, end: 1333 }]
      },
      {
        name: '顺帝妥懽帖睦尔',
        start: 1333,
        end: 1368,
        eras: [
          { name: '元统', start: 1333, end: 1335 },
          { name: '至元', start: 1335, end: 1340 },
          { name: '至正', start: 1341, end: 1368 }
        ]
      }
    ]
  },
  {
    name: '明',
    start: 1368,
    end: 1644,
    emperors: [
      {
        name: '太祖朱元璋',
        start: 1368,
        end: 1398,
        eras: [{ name: '洪武', start: 1368, end: 1398 }]
      },
      {
        name: '惠宗朱允炆',
        start: 1399,
        end: 1402,
        eras: [{ name: '建文', start: 1399, end: 1402 }]
      },
      {
        name: '成祖朱棣',
        start: 1403,
        end: 1424,
        eras: [{ name: '永乐', start: 1403, end: 1424 }]
      },
      {
        name: '仁宗朱高炽',
        start: 1425,
        end: 1425,
        eras: [{ name: '洪熙', start: 1425, end: 1425 }]
      },
      {
        name: '宣宗朱瞻基',
        start: 1426,
        end: 1435,
        eras: [{ name: '宣德', start: 1426, end: 1435 }]
      },
      {
        name: '英宗朱祁镇',
        start: 1436,
        end: 1449,
        eras: [{ name: '正统', start: 1436, end: 1449 }]
      },
      {
        name: '代宗朱祁钰',
        start: 1450,
        end: 1457,
        eras: [{ name: '景泰', start: 1450, end: 1457 }]
      },
      {
        name: '英宗朱祁镇（复位）',
        start: 1457,
        end: 1464,
        eras: [{ name: '天顺', start: 1457, end: 1464 }]
      },
      {
        name: '宪宗朱见深',
        start: 1465,
        end: 1487,
        eras: [{ name: '成化', start: 1465, end: 1487 }]
      },
      {
        name: '孝宗朱祐樘',
        start: 1488,
        end: 1505,
        eras: [{ name: '弘治', start: 1488, end: 1505 }]
      },
      {
        name: '武宗朱厚照',
        start: 1506,
        end: 1521,
        eras: [{ name: '正德', start: 1506, end: 1521 }]
      },
      {
        name: '世宗朱厚熜',
        start: 1522,
        end: 1566,
        eras: [{ name: '嘉靖', start: 1522, end: 1566 }]
      },
      {
        name: '穆宗朱载坖',
        start: 1567,
        end: 1572,
        eras: [{ name: '隆庆', start: 1567, end: 1572 }]
      },
      {
        name: '神宗朱翊钧',
        start: 1573,
        end: 1620,
        eras: [{ name: '万历', start: 1573, end: 1620 }]
      },
      {
        name: '光宗朱常洛',
        start: 1620,
        end: 1620,
        eras: [{ name: '泰昌', start: 1620, end: 1620 }]
      },
      {
        name: '熹宗朱由校',
        start: 1621,
        end: 1627,
        eras: [{ name: '天启', start: 1621, end: 1627 }]
      },
      {
        name: '思宗朱由检',
        start: 1628,
        end: 1644,
        eras: [{ name: '崇祯', start: 1628, end: 1644 }]
      }
    ]
  },
  {
    name: '清',
    start: 1644,
    end: 1912,
    emperors: [
      {
        name: '太祖努尔哈赤',
        start: 1616,
        end: 1626,
        eras: [{ name: '天命', start: 1616, end: 1626 }]
      },
      {
        name: '太宗皇太极',
        start: 1627,
        end: 1643,
        eras: [
          { name: '天聪', start: 1627, end: 1636 },
          { name: '崇德', start: 1636, end: 1643 }
        ]
      },
      {
        name: '世祖福临',
        start: 1644,
        end: 1661,
        eras: [{ name: '顺治', start: 1644, end: 1661 }]
      },
      {
        name: '圣祖玄烨',
        start: 1662,
        end: 1722,
        eras: [{ name: '康熙', start: 1662, end: 1722 }]
      },
      {
        name: '世宗胤禛',
        start: 1723,
        end: 1735,
        eras: [{ name: '雍正', start: 1723, end: 1735 }]
      },
      {
        name: '高宗弘历',
        start: 1736,
        end: 1795,
        eras: [{ name: '乾隆', start: 1736, end: 1795 }]
      },
      {
        name: '仁宗颙琰',
        start: 1796,
        end: 1820,
        eras: [{ name: '嘉庆', start: 1796, end: 1820 }]
      },
      {
        name: '宣宗旻宁',
        start: 1821,
        end: 1850,
        eras: [{ name: '道光', start: 1821, end: 1850 }]
      },
      {
        name: '文宗奕詝',
        start: 1851,
        end: 1861,
        eras: [{ name: '咸丰', start: 1851, end: 1861 }]
      },
      {
        name: '穆宗载淳',
        start: 1862,
        end: 1874,
        eras: [{ name: '同治', start: 1862, end: 1874 }]
      },
      {
        name: '德宗载湉',
        start: 1875,
        end: 1908,
        eras: [{ name: '光绪', start: 1875, end: 1908 }]
      },
      {
        name: '溥仪',
        start: 1909,
        end: 1912,
        eras: [{ name: '宣统', start: 1909, end: 1912 }]
      }
    ]
  },
  {
    name: '太平天国',
    start: 1851,
    end: 1864,
    emperors: [
      {
        name: '天王洪秀全',
        start: 1851,
        end: 1864,
        eras: [{ name: '太平天国', start: 1851, end: 1864 }]
      }
    ]
  },
  {
    name: '民国',
    start: 1912,
    end: 1949,
    emperors: [
      {
        name: '中华民国',
        start: 1912,
        end: 1949,
        eras: [{ name: '民国', start: 1912, end: 1949 }]
      }
    ]
  }
];