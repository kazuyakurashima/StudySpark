/**
 * 基本的なリポジトリインターフェース
 * すべてのリポジトリはこのインターフェースを実装する
 */
export interface Repository<T> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

/**
 * リポジトリファクトリ
 * リポジトリのインスタンスを管理する
 */
export class RepositoryFactory {
  private static repositories: Map<string, any> = new Map()

  /**
   * リポジトリを登録
   */
  static register<T>(name: string, repository: T): void {
    this.repositories.set(name, repository)
  }

  /**
   * リポジトリを取得
   */
  static get<T>(name: string): T {
    const repository = this.repositories.get(name)

    if (!repository) {
      throw new Error(`Repository ${name} not found`)
    }

    return repository
  }

  /**
   * リポジトリが存在するか確認
   */
  static has(name: string): boolean {
    return this.repositories.has(name)
  }

  /**
   * リポジトリを削除
   */
  static remove(name: string): void {
    this.repositories.delete(name)
  }

  /**
   * すべてのリポジトリを削除
   */
  static clear(): void {
    this.repositories.clear()
  }
}
