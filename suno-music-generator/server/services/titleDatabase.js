const fs = require('fs');
const path = require('path');

/**
 * 영구 제목 데이터베이스 관리 클래스
 * - 제목 중복 방지
 * - 메타데이터 저장 (생성 일시, 사용 횟수, 테마 등)
 * - 통계 기능
 */
class TitleDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/titles.db.json');
    this.legacyDbPath = path.join(__dirname, '../data/used_titles.json');
    this.db = this.loadDatabase();
    
    console.log(`📚 Title Database initialized: ${this.getTotalCount()} titles`);
  }

  /**
   * 데이터베이스 로드
   */
  loadDatabase() {
    try {
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // 새 DB 파일 존재 확인
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        const db = JSON.parse(data);
        console.log(`✅ Loaded ${Object.keys(db.titles || {}).length} titles from new database`);
        return db;
      }

      // 레거시 DB 마이그레이션
      if (fs.existsSync(this.legacyDbPath)) {
        console.log(`🔄 Migrating legacy titles database...`);
        return this.migrateLegacyDatabase();
      }

      // 새 DB 생성
      console.log('📝 Creating new title database');
      return {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        titles: {},
        stats: {
          totalGenerated: 0,
          totalUnique: 0,
          lastUpdated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('⚠️ Failed to load database:', error.message);
      return {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        titles: {},
        stats: {
          totalGenerated: 0,
          totalUnique: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  /**
   * 레거시 데이터베이스 마이그레이션
   */
  migrateLegacyDatabase() {
    try {
      const legacyData = fs.readFileSync(this.legacyDbPath, 'utf8');
      const legacyTitles = JSON.parse(legacyData);

      const db = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        titles: {},
        stats: {
          totalGenerated: legacyTitles.length,
          totalUnique: legacyTitles.length,
          lastUpdated: new Date().toISOString()
        }
      };

      // 각 제목을 새 형식으로 변환
      legacyTitles.forEach(title => {
        const cleanTitle = title.toLowerCase().trim();
        if (cleanTitle) {
          db.titles[cleanTitle] = {
            title: title,
            usageCount: 1,
            firstUsed: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            themes: [],
            strategies: []
          };
        }
      });

      console.log(`✅ Migrated ${Object.keys(db.titles).length} legacy titles`);
      
      // 새 DB 저장
      this.saveDatabase(db);
      
      // 레거시 DB 백업
      const backupPath = this.legacyDbPath + '.backup';
      fs.copyFileSync(this.legacyDbPath, backupPath);
      console.log(`📦 Legacy database backed up to: ${backupPath}`);

      return db;

    } catch (error) {
      console.error('⚠️ Failed to migrate legacy database:', error.message);
      return {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        titles: {},
        stats: {
          totalGenerated: 0,
          totalUnique: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  /**
   * 데이터베이스 저장
   */
  saveDatabase(db = this.db) {
    try {
      // 통계 업데이트
      db.stats.totalUnique = Object.keys(db.titles).length;
      db.stats.lastUpdated = new Date().toISOString();

      // JSON 저장 (pretty-print)
      fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      // 압축 버전도 저장 (백업용)
      const compactPath = this.dbPath.replace('.json', '.compact.json');
      fs.writeFileSync(compactPath, JSON.stringify(db), 'utf8');
      
      console.log(`💾 Saved ${db.stats.totalUnique} titles to database`);
      
    } catch (error) {
      console.error('⚠️ Failed to save database:', error.message);
    }
  }

  /**
   * 제목 중복 확인
   */
  isDuplicate(title) {
    const cleanTitle = title.split('/')[0].trim().toLowerCase();
    return this.db.titles.hasOwnProperty(cleanTitle);
  }

  /**
   * 제목 추가 (메타데이터 포함)
   */
  addTitle(title, metadata = {}) {
    const cleanTitle = title.split('/')[0].trim().toLowerCase();
    const now = new Date().toISOString();

    if (this.db.titles[cleanTitle]) {
      // 기존 제목: 사용 횟수 증가
      this.db.titles[cleanTitle].usageCount += 1;
      this.db.titles[cleanTitle].lastUsed = now;
      
      // 테마 추가 (중복 제거)
      if (metadata.theme && !this.db.titles[cleanTitle].themes.includes(metadata.theme)) {
        this.db.titles[cleanTitle].themes.push(metadata.theme);
      }
      
      // 전략 추가 (중복 제거)
      if (metadata.strategy && !this.db.titles[cleanTitle].strategies.includes(metadata.strategy)) {
        this.db.titles[cleanTitle].strategies.push(metadata.strategy);
      }

    } else {
      // 새 제목: 추가
      this.db.titles[cleanTitle] = {
        title: title,
        usageCount: 1,
        firstUsed: now,
        lastUsed: now,
        themes: metadata.theme ? [metadata.theme] : [],
        strategies: metadata.strategy ? [metadata.strategy] : []
      };
      
      this.db.stats.totalGenerated += 1;
    }

    return cleanTitle;
  }

  /**
   * 제목 배치 추가
   */
  addTitles(titles, metadata = {}) {
    const addedTitles = [];
    
    titles.forEach(title => {
      const cleanTitle = this.addTitle(title, metadata);
      addedTitles.push(cleanTitle);
    });

    // 저장
    this.saveDatabase();

    return addedTitles;
  }

  /**
   * 제목 검색
   */
  getTitle(title) {
    const cleanTitle = title.toLowerCase().trim();
    return this.db.titles[cleanTitle] || null;
  }

  /**
   * 제목 리스트 가져오기 (최근 N개)
   */
  getRecentTitles(count = 50) {
    const titles = Object.values(this.db.titles);
    return titles
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, count)
      .map(t => t.title);
  }

  /**
   * 자주 사용된 제목 가져오기 (Top N)
   */
  getTopTitles(count = 50) {
    const titles = Object.values(this.db.titles);
    return titles
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, count)
      .map(t => ({ title: t.title, count: t.usageCount }));
  }

  /**
   * 통계 정보
   */
  getStats() {
    const titles = Object.values(this.db.titles);
    const totalUsage = titles.reduce((sum, t) => sum + t.usageCount, 0);
    
    return {
      ...this.db.stats,
      totalUsage: totalUsage,
      averageUsage: totalUsage / titles.length || 0,
      mostUsedTitle: titles.length > 0 
        ? titles.reduce((max, t) => t.usageCount > max.usageCount ? t : max, titles[0])
        : null
    };
  }

  /**
   * 총 제목 개수
   */
  getTotalCount() {
    return Object.keys(this.db.titles).length;
  }

  /**
   * 제목 삭제 (관리용)
   */
  deleteTitle(title) {
    const cleanTitle = title.toLowerCase().trim();
    if (this.db.titles[cleanTitle]) {
      delete this.db.titles[cleanTitle];
      this.saveDatabase();
      return true;
    }
    return false;
  }

  /**
   * 데이터베이스 리셋 (위험!)
   */
  reset() {
    this.db = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      titles: {},
      stats: {
        totalGenerated: 0,
        totalUnique: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    this.saveDatabase();
    console.log('⚠️ Database reset complete');
  }

  /**
   * 데이터베이스 백업
   */
  backup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.dbPath.replace('.json', `.backup.${timestamp}.json`);
      fs.copyFileSync(this.dbPath, backupPath);
      console.log(`📦 Database backed up to: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('⚠️ Failed to backup database:', error.message);
      return null;
    }
  }
}

module.exports = TitleDatabase;
