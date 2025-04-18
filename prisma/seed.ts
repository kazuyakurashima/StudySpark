import { PrismaClient } from '../lib/generated/prisma';
const prisma = new PrismaClient();

async function main() {
  try {
    // avatarsテーブルをクリア
    await prisma.avatar.deleteMany({});
    console.log('Avatarsテーブルをクリアしました');

    // ユーザーアバターの登録
    const userAvatars = [
      { id: 'user1', label: '男子学生1', imagePath: '/images/avatars/users/user1.png' },
      { id: 'user2', label: '女子学生1', imagePath: '/images/avatars/users/user2.png' },
      { id: 'user3', label: '男子学生2', imagePath: '/images/avatars/users/user3.png' },
      { id: 'user4', label: '女子学生2', imagePath: '/images/avatars/users/user4.png' },
      { id: 'user5', label: '男子学生3', imagePath: '/images/avatars/users/user5.png' },
      { id: 'user6', label: '女子学生3', imagePath: '/images/avatars/users/user6.png' },
    ];

    // コーチアバターの登録
    const coachAvatars = [
      { id: 'coach1', label: '男性コーチ1', imagePath: '/images/avatars/coaches/coach1.png' },
      { id: 'coach2', label: '女性コーチ1', imagePath: '/images/avatars/coaches/coach2.png' },
      { id: 'coach3', label: '男性コーチ2', imagePath: '/images/avatars/coaches/coach3.png' },
      { id: 'coach4', label: '女性コーチ2', imagePath: '/images/avatars/coaches/coach4.png' },
      { id: 'coach5', label: '男性コーチ3', imagePath: '/images/avatars/coaches/coach5.png' },
      { id: 'coach6', label: '女性コーチ3', imagePath: '/images/avatars/coaches/coach6.png' },
    ];

    // すべてのアバターを登録
    const allAvatars = [...userAvatars, ...coachAvatars];
    for (const avatar of allAvatars) {
      await prisma.avatar.create({
        data: avatar,
      });
    }
    console.log(`${allAvatars.length}個のアバターを登録しました`);

    // テスト名の選択肢を登録
    await prisma.testNameOption.deleteMany({});
    
    const testNameOptions = [
      { label: '中間テスト', category: 'test_name', isCustom: false },
      { label: '期末テスト', category: 'test_name', isCustom: false },
      { label: '実力テスト', category: 'test_name', isCustom: false },
      { label: '模擬試験', category: 'test_name', isCustom: false },
      { label: '定期テスト', category: 'test_name', isCustom: false },
      { label: '入学試験', category: 'test_name', isCustom: false },
      { label: 'その他', category: 'test_name', isCustom: true },
    ];

    for (const option of testNameOptions) {
      await prisma.testNameOption.create({
        data: option,
      });
    }
    console.log(`${testNameOptions.length}個のテスト名選択肢を登録しました`);

    // 理由の選択肢を登録
    await prisma.reasonOption.deleteMany({});
    
    const reasonOptions = [
      { label: '志望校に合格したい', category: 'goal_reason', isCustom: false },
      { label: '成績を上げたい', category: 'goal_reason', isCustom: false },
      { label: '親に褒められたい', category: 'goal_reason', isCustom: false },
      { label: '部活と両立したい', category: 'goal_reason', isCustom: false },
      { label: '自分に自信をつけたい', category: 'goal_reason', isCustom: false },
      { label: '将来の夢のため', category: 'goal_reason', isCustom: false },
      { label: '友達と競争したい', category: 'goal_reason', isCustom: false },
      { label: 'その他', category: 'goal_reason', isCustom: true },
    ];

    for (const option of reasonOptions) {
      await prisma.reasonOption.create({
        data: option,
      });
    }
    console.log(`${reasonOptions.length}個の理由選択肢を登録しました`);

    console.log('🌱 シード処理が完了しました');
  } catch (e) {
    console.error('シード処理中にエラーが発生しました:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 