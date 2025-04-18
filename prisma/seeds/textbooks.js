/**
 * 教材データのシードファイル
 */

// 難易度の定義
const DIFFICULTY = {
  BASIC: 1,     // 基本問題
  STANDARD: 2,  // 標準問題
  ADVANCED: 3   // 発展問題
};

/**
 * 教材データをデータベースに登録する関数
 * @param {PrismaClient} prisma - Prismaクライアントインスタンス
 */
async function seedTextbooks(prisma) {
  try {
    // データベースをクリア
    await prisma.question.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.chapter.deleteMany({});
    await prisma.textbook.deleteMany({});
    console.log('教材関連テーブルをクリアしました');

    // 教科書を登録
    const textbook = await prisma.textbook.create({
      data: {
        title: '体系問題集　数学1　代数編',
      }
    });
    console.log(`教科書「${textbook.title}」を登録しました`);

    // 章データの定義
    const chapters = [
      { title: '第1章 正の数と負の数', orderIndex: 1 },
      { title: '第2章 式の計算', orderIndex: 2 },
      { title: '第3章 方程式', orderIndex: 3 },
      { title: '第4章 不等式', orderIndex: 4 },
      { title: '第5章 1次関数', orderIndex: 5 },
    ];

    // 章を登録してIDを取得
    const createdChapters = [];
    for (const chapter of chapters) {
      const createdChapter = await prisma.chapter.create({
        data: {
          title: chapter.title,
          orderIndex: chapter.orderIndex,
          textbookId: textbook.id,
        }
      });
      createdChapters.push(createdChapter);
    }
    console.log(`${createdChapters.length}個の章を登録しました`);

    // 項目データの定義（章ごと）
    const sectionsByChapter = [
      // 第1章 正の数と負の数
      [
        { title: '① 正の数と負の数', orderIndex: 1 },
        { title: '② 加法と減法', orderIndex: 2 },
        { title: '③ 乗法と除法', orderIndex: 3 },
        { title: '④ 四則の混じった計算', orderIndex: 4 },
        { title: '章末問題', orderIndex: 5 },
      ],
      // 第2章 式の計算
      [
        { title: '① 文字式', orderIndex: 1 },
        { title: '② 多項式の計算', orderIndex: 2 },
        { title: '③ 単項式の乗法と除法', orderIndex: 3 },
        { title: '④ 文字式の利用', orderIndex: 4 },
        { title: '章末問題', orderIndex: 5 },
      ],
      // 第3章 方程式
      [
        { title: '① 方程式とその解 / ② １次方程式の解き方', orderIndex: 1 },
        { title: '③ 1次方程式の利用', orderIndex: 2 },
        { title: '④ 連立方程式', orderIndex: 3 },
        { title: '⑤ 連立方程式の利用', orderIndex: 4 },
        { title: '章末問題', orderIndex: 5 },
      ],
      // 第4章 不等式
      [
        { title: '① 不等式の性質 / ② 不等式の解き方', orderIndex: 1 },
        { title: '③ 不等式の利用', orderIndex: 2 },
        { title: '④ 連立不等式', orderIndex: 3 },
        { title: '章末問題', orderIndex: 4 },
      ],
      // 第5章 1次関数
      [
        { title: '① 変化と関数', orderIndex: 1 },
        { title: '② 比例とそのグラフ', orderIndex: 2 },
        { title: '③ 反比例とそのグラフ', orderIndex: 3 },
        { title: '④ 比例,反比例の利用', orderIndex: 4 },
        { title: '⑤ 1次関数とそのグラフ', orderIndex: 5 },
        { title: '⑥ 1次関数と方程式', orderIndex: 6 },
        { title: '⑦ 1次関数の利用', orderIndex: 7 },
        { title: '章末問題', orderIndex: 8 },
      ],
    ];

    // 項目と問題の登録
    let totalSections = 0;
    let totalQuestions = 0;

    // 章ごとに項目と問題を登録
    for (let chapterIndex = 0; chapterIndex < createdChapters.length; chapterIndex++) {
      const chapter = createdChapters[chapterIndex];
      const sections = sectionsByChapter[chapterIndex];
      
      // 各項目を登録
      for (const section of sections) {
        const createdSection = await prisma.section.create({
          data: {
            title: section.title,
            orderIndex: section.orderIndex,
            chapterId: chapter.id,
          }
        });
        totalSections++;
        
        // 項目ごとの問題データを生成・登録
        let questions = [];
        
        // 章末問題の場合
        if (section.title === '章末問題') {
          // 章末問題
          for (let i = 1; i <= 6; i++) {
            if ((chapterIndex === 0 || chapterIndex === 1 || chapterIndex === 4) && i > 5) continue; // 章によって問題数を調整
            
            questions.push({
              content: `第${chapterIndex + 1}章 章末問題 問題${i}`,
              difficulty: DIFFICULTY.ADVANCED,
              sectionId: createdSection.id
            });
          }
        } 
        // 通常の項目
        else {
          // チャプターと項目に応じて問題データを生成
          switch(chapterIndex) {
            case 0: // 第1章
              switch(section.orderIndex) {
                case 1: // 正の数と負の数
                  // 基本問題
                  for (let i = 1; i <= 11; i++) {
                    questions.push({
                      content: `第1章 正の数と負の数 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 12; i <= 14; i++) {
                    questions.push({
                      content: `第1章 正の数と負の数 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 2: // 加法と減法
                  // 基本問題
                  for (let i = 15; i <= 25; i++) {
                    questions.push({
                      content: `第1章 加法と減法 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 26; i <= 29; i++) {
                    questions.push({
                      content: `第1章 加法と減法 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 3: // 乗法と除法
                  // 基本問題
                  for (let i = 30; i <= 39; i++) {
                    questions.push({
                      content: `第1章 乗法と除法 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 40; i <= 44; i++) {
                    questions.push({
                      content: `第1章 乗法と除法 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 4: // 四則の混じった計算
                  // 基本問題
                  for (let i = 45; i <= 57; i++) {
                    questions.push({
                      content: `第1章 四則の混じった計算 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 58; i <= 61; i++) {
                    questions.push({
                      content: `第1章 四則の混じった計算 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
              }
              break;
            case 1: // 第2章
              switch(section.orderIndex) {
                case 1: // 文字式
                  // 基本問題
                  for (let i = 1; i <= 11; i++) {
                    questions.push({
                      content: `第2章 文字式 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 12; i <= 13; i++) {
                    questions.push({
                      content: `第2章 文字式 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 2: // 多項式の計算
                  // 基本問題
                  for (let i = 14; i <= 29; i++) {
                    questions.push({
                      content: `第2章 多項式の計算 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 30; i <= 33; i++) {
                    questions.push({
                      content: `第2章 多項式の計算 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 3: // 単項式の乗法と除法
                  // 基本問題
                  for (let i = 34; i <= 39; i++) {
                    questions.push({
                      content: `第2章 単項式の乗法と除法 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 40; i <= 41; i++) {
                    questions.push({
                      content: `第2章 単項式の乗法と除法 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 4: // 文字式の利用
                  // 基本問題
                  for (let i = 42; i <= 45; i++) {
                    questions.push({
                      content: `第2章 文字式の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 46; i <= 48; i++) {
                    questions.push({
                      content: `第2章 文字式の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  questions.push({
                    content: `第2章 文字式の利用 発展問題49`,
                    difficulty: DIFFICULTY.ADVANCED,
                    sectionId: createdSection.id
                  });
                  break;
              }
              break;
            case 2: // 第3章
              switch(section.orderIndex) {
                case 1: // 方程式とその解 / １次方程式の解き方
                  // 基本問題
                  for (let i = 1; i <= 12; i++) {
                    questions.push({
                      content: `第3章 方程式とその解/１次方程式の解き方 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 13; i <= 14; i++) {
                    questions.push({
                      content: `第3章 方程式とその解/１次方程式の解き方 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 2: // 1次方程式の利用
                  // 基本問題
                  for (let i = 15; i <= 27; i++) {
                    questions.push({
                      content: `第3章 1次方程式の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 28; i <= 34; i++) {
                    questions.push({
                      content: `第3章 1次方程式の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 35; i <= 36; i++) {
                    questions.push({
                      content: `第3章 1次方程式の利用 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 3: // 連立方程式
                  // 基本問題
                  for (let i = 37; i <= 44; i++) {
                    questions.push({
                      content: `第3章 連立方程式 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 45; i <= 47; i++) {
                    questions.push({
                      content: `第3章 連立方程式 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 48; i <= 49; i++) {
                    questions.push({
                      content: `第3章 連立方程式 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 4: // 連立方程式の利用
                  // 基本問題
                  for (let i = 50; i <= 58; i++) {
                    questions.push({
                      content: `第3章 連立方程式の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 59; i <= 63; i++) {
                    questions.push({
                      content: `第3章 連立方程式の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
              }
              break;
            case 3: // 第4章
              switch(section.orderIndex) {
                case 1: // 不等式の性質 / 不等式の解き方
                  // 基本問題
                  for (let i = 1; i <= 14; i++) {
                    questions.push({
                      content: `第4章 不等式の性質/不等式の解き方 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 15; i <= 16; i++) {
                    questions.push({
                      content: `第4章 不等式の性質/不等式の解き方 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 17; i <= 18; i++) {
                    questions.push({
                      content: `第4章 不等式の性質/不等式の解き方 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 2: // 不等式の利用
                  // 基本問題
                  for (let i = 19; i <= 25; i++) {
                    questions.push({
                      content: `第4章 不等式の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 26; i <= 30; i++) {
                    questions.push({
                      content: `第4章 不等式の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 31; i <= 33; i++) {
                    questions.push({
                      content: `第4章 不等式の利用 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 3: // 連立不等式
                  // 基本問題
                  for (let i = 34; i <= 40; i++) {
                    questions.push({
                      content: `第4章 連立不等式 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 41; i <= 49; i++) {
                    questions.push({
                      content: `第4章 連立不等式 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 50; i <= 51; i++) {
                    questions.push({
                      content: `第4章 連立不等式 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
              }
              break;
            case 4: // 第5章
              switch(section.orderIndex) {
                case 1: // 変化と関数
                  // 基本問題
                  for (let i = 1; i <= 2; i++) {
                    questions.push({
                      content: `第5章 変化と関数 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 2: // 比例とそのグラフ
                  // 基本問題
                  for (let i = 3; i <= 17; i++) {
                    questions.push({
                      content: `第5章 比例とそのグラフ 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 18; i <= 19; i++) {
                    questions.push({
                      content: `第5章 比例とそのグラフ 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  questions.push({
                    content: `第5章 比例とそのグラフ 発展問題20`,
                    difficulty: DIFFICULTY.ADVANCED,
                    sectionId: createdSection.id
                  });
                  break;
                case 3: // 反比例とそのグラフ
                  // 基本問題
                  for (let i = 21; i <= 30; i++) {
                    questions.push({
                      content: `第5章 反比例とそのグラフ 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 31; i <= 33; i++) {
                    questions.push({
                      content: `第5章 反比例とそのグラフ 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 4: // 比例,反比例の利用
                  // 基本問題
                  for (let i = 34; i <= 35; i++) {
                    questions.push({
                      content: `第5章 比例,反比例の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 36; i <= 38; i++) {
                    questions.push({
                      content: `第5章 比例,反比例の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 5: // 1次関数とそのグラフ
                  // 基本問題
                  for (let i = 39; i <= 55; i++) {
                    questions.push({
                      content: `第5章 1次関数とそのグラフ 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 56; i <= 60; i++) {
                    questions.push({
                      content: `第5章 1次関数とそのグラフ 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 61; i <= 63; i++) {
                    questions.push({
                      content: `第5章 1次関数とそのグラフ 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 6: // 1次関数と方程式
                  // 基本問題
                  for (let i = 64; i <= 69; i++) {
                    questions.push({
                      content: `第5章 1次関数と方程式 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 70; i <= 72; i++) {
                    questions.push({
                      content: `第5章 1次関数と方程式 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  break;
                case 7: // 1次関数の利用
                  // 基本問題
                  for (let i = 73; i <= 79; i++) {
                    questions.push({
                      content: `第5章 1次関数の利用 基本問題${i}`,
                      difficulty: DIFFICULTY.BASIC,
                      sectionId: createdSection.id
                    });
                  }
                  // 標準問題
                  for (let i = 80; i <= 88; i++) {
                    questions.push({
                      content: `第5章 1次関数の利用 標準問題${i}`,
                      difficulty: DIFFICULTY.STANDARD,
                      sectionId: createdSection.id
                    });
                  }
                  // 発展問題
                  for (let i = 89; i <= 92; i++) {
                    questions.push({
                      content: `第5章 1次関数の利用 発展問題${i}`,
                      difficulty: DIFFICULTY.ADVANCED,
                      sectionId: createdSection.id
                    });
                  }
                  break;
              }
              break;
          }
        }
        
        // 問題をデータベースに登録
        for (const question of questions) {
          await prisma.question.create({
            data: question
          });
          totalQuestions++;
        }
      }
    }
    
    console.log(`${totalSections}個の項目を登録しました`);
    console.log(`${totalQuestions}個の問題を登録しました`);
    console.log('教材データの登録が完了しました');
    
  } catch (e) {
    console.error('教材データの登録中にエラーが発生しました:', e);
    throw e;
  }
}

module.exports = seedTextbooks; 