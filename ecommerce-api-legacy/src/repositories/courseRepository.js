class CourseRepository {
  constructor(db) { this.db = db; }
  findActive(id, callback) { this.db.get('SELECT * FROM courses WHERE id = ? AND active = 1', [id], callback); }
}
module.exports = CourseRepository;
