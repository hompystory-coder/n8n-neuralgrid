const express = require('express');
const router = express.Router();
const TitleDatabase = require('../services/titleDatabase');

// 제목 데이터베이스 인스턴스
let titleDB = null;

function getTitleDB() {
  if (!titleDB) {
    titleDB = new TitleDatabase();
  }
  return titleDB;
}

/**
 * 통계 API
 */

// 1. 전체 통계
router.get('/titles', async (req, res) => {
  try {
    const db = getTitleDB();
    const stats = db.getStats();
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 2. 최근 사용된 제목
router.get('/titles/recent', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const db = getTitleDB();
    const titles = db.getRecentTitles(count);
    
    res.json({
      success: true,
      count: titles.length,
      titles: titles
    });
    
  } catch (error) {
    console.error('❌ Recent titles error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 3. 자주 사용된 제목 (Top N)
router.get('/titles/top', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const db = getTitleDB();
    const titles = db.getTopTitles(count);
    
    res.json({
      success: true,
      count: titles.length,
      titles: titles
    });
    
  } catch (error) {
    console.error('❌ Top titles error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 4. 특정 제목 검색
router.get('/titles/search', async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({ error: 'Title parameter is required' });
    }
    
    const db = getTitleDB();
    const titleData = db.getTitle(title);
    
    if (titleData) {
      res.json({
        success: true,
        title: titleData
      });
    } else {
      res.json({
        success: true,
        title: null,
        message: 'Title not found'
      });
    }
    
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 5. 데이터베이스 백업
router.post('/titles/backup', async (req, res) => {
  try {
    const db = getTitleDB();
    const backupPath = db.backup();
    
    if (backupPath) {
      res.json({
        success: true,
        backupPath: backupPath,
        message: 'Database backed up successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create backup'
      });
    }
    
  } catch (error) {
    console.error('❌ Backup error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
