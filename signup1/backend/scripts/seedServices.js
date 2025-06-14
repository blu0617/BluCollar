require('dotenv').config();
const mysql = require('mysql');

// MySQL connection details (using environment variables from .env)
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_DATABASE || 'Signup',
});

// Seed data: Services
const services = [
  {
    name: 'Plumbing Services',
    category: 'plumbing',
    description: 'Professional plumbing services including repairs, installations, and maintenance.',
    keywords: JSON.stringify(['pipe', 'faucet', 'drain', 'toilet', 'water heater', 'plumbing']), // Stringify JSON
    averagePrice: 150,
    imageUrl: '/assets/services/plumbing.jpg',
    isActive: 1 // tinyint(1) for boolean
  },
  {
    name: 'Electrical Services',
    category: 'electrical',
    description: 'Expert electrical services for repairs, installations, and safety inspections.',
    keywords: JSON.stringify(['wiring', 'outlet', 'switch', 'circuit', 'electrical', 'power']), // Stringify JSON
    averagePrice: 200,
    imageUrl: '/assets/services/electrical.jpg',
    isActive: 1
  },
  {
    name: 'Cleaning Services',
    category: 'cleaning',
    description: 'Comprehensive cleaning services for homes and offices.',
    keywords: JSON.stringify(['broom', 'mop', 'vacuum', 'cleaning', 'dust', 'dirt', 'clean']), // Stringify JSON
    averagePrice: 100,
    imageUrl: '/assets/services/cleaning.jpg',
    isActive: 1
  },
  {
    name: 'Carpentry Services',
    category: 'carpentry',
    description: 'Skilled carpentry work for furniture, repairs, and custom installations.',
    keywords: JSON.stringify(['wood', 'hammer', 'nail', 'saw', 'carpentry', 'furniture', 'repair']), // Stringify JSON
    averagePrice: 175,
    imageUrl: '/assets/services/carpentry.jpg',
    isActive: 1
  },
  {
    name: 'Painting Services',
    category: 'painting',
    description: 'Professional painting services for interior and exterior surfaces.',
    keywords: JSON.stringify(['paint', 'brush', 'wall', 'color', 'painting', 'decorate']), // Stringify JSON
    averagePrice: 125,
    imageUrl: '/assets/services/painting.jpg',
    isActive: 1
  },
  {
    name: 'Gardening Services',
    category: 'gardening',
    description: 'Expert gardening and landscaping services for your outdoor spaces.',
    keywords: JSON.stringify(['garden', 'landscape', 'lawn', 'flower', 'tree', 'gardening', 'landscape']), // Stringify JSON
    averagePrice: 90,
    imageUrl: '/assets/services/gardening.jpg',
    isActive: 1
  }
];

// Seed data: Workers (matching your schema precisely)
const workers = [
  {
    profession: 'Plumber',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown',
    password: 'hashedpassword', // 🔒 Remember to hash in production
    skills: JSON.stringify(['pipe repair', 'drain cleaning']), // Stringify JSON
    certifications: JSON.stringify(['Certified Plumber']), // Stringify JSON
    experience: '5 years', // Matches varchar(50) for experience
    description: 'Experienced plumber and electrician with a strong track record.',
    profile_photo: '/assets/workers/john_doe.jpg',
    portfolio_files: JSON.stringify([]), // Stringify JSON
    profileImage: '/assets/workers/john_doe.jpg', // Matches column name
    specializations: JSON.stringify(['plumbing', 'electrical']), // Matches column name
    rating: 4.9,
    reviewCount: 75,
    successRate: 98.0,
    isAvailable: 1,
    latitude: 34.052235,
    longitude: -118.243683,
    completedJobs: 80,
    hourlyRate: 35.0,
    bio: 'Experienced plumber and electrician with a strong track record.',
    documents: JSON.stringify([]),
    availability: JSON.stringify({monday: { start: '09:00', end: '17:00' }, tuesday: { start: '09:00', end: '17:00' }})
  },
  {
    profession: 'Cleaner',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '987-654-3210',
    address: '456 Oak Ave, Anytown',
    password: 'anotherhashedpassword', // 🔒 Remember to hash in production
    skills: JSON.stringify(['deep cleaning', 'office cleaning']), // Stringify JSON
    certifications: JSON.stringify([]), // Stringify JSON
    experience: '3 years', // Matches varchar(50) for experience
    description: 'Dedicated and thorough cleaner for homes and offices.',
    profile_photo: '/assets/workers/jane_smith.jpg',
    portfolio_files: JSON.stringify([]), // Stringify JSON
    profileImage: '/assets/workers/jane_smith.jpg',
    specializations: JSON.stringify(['cleaning']),
    rating: 4.7,
    reviewCount: 50,
    successRate: 95.0,
    isAvailable: 1,
    latitude: 34.052235,
    longitude: -118.243683,
    completedJobs: 60,
    hourlyRate: 25.0,
    bio: 'Dedicated and thorough cleaner for homes and offices.',
    documents: JSON.stringify([]),
    availability: JSON.stringify({wednesday: { start: '09:00', end: '17:00' }, thursday: { start: '09:00', end: '17:00' }})
  }
];

// Seed function
const seedDatabase = async () => {
  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection error for seeding:', err);
      return process.exit(1);
    }
    console.log('✅ Seeding script connected to MySQL.');

    // Disable foreign key checks
    db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
      if (err) console.error('❌ Error disabling foreign key checks:', err);

      // Clear existing data in correct order (child tables first)
      const truncatePortfolio = 'TRUNCATE TABLE worker_portfolios'; // Truncate child table first
      const truncateWorkers = 'TRUNCATE TABLE workers'; // Then parent table
      const truncateServices = 'TRUNCATE TABLE services';

      db.query(truncatePortfolio, (err) => {
        if (err) console.error('❌ Error truncating worker_portfolios table:', err);
        else console.log('Truncated worker_portfolios table.');

        db.query(truncateWorkers, (err) => {
          if (err) console.error('❌ Error truncating workers table:', err);
          else console.log('Truncated workers table.');

          db.query(truncateServices, (err) => {
            if (err) console.error('❌ Error truncating services table:', err);
            else console.log('Truncated services table.');

            // Re-enable foreign key checks
            db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
              if (err) console.error('❌ Error re-enabling foreign key checks:', err);
              else console.log('Re-enabled foreign key checks.');

              // Insert services
              services.forEach(service => {
                const serviceSql = `INSERT INTO services (
                  name, category, description, keywords, averagePrice, imageUrl, isActive, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
                const serviceValues = [
                  service.name, service.category, service.description, service.keywords,
                  service.averagePrice, service.imageUrl, service.isActive
                ];
                db.query(serviceSql, serviceValues, (err) => {
                  if (err) console.error('❌ Error inserting service:', err);
                });
              });
              console.log('Services insert commands sent.');

              // Insert workers
              workers.forEach(worker => {
                const workerSql = `INSERT INTO workers (
                  profession, name, email, phone, address, password, skills, certifications, experience, description,
                  profile_photo, portfolio_files, profileImage, specializations, rating, reviewCount, successRate,
                  isAvailable, latitude, longitude, completedJobs, hourlyRate, bio, documents, availability, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
                const workerValues = [
                  worker.profession, worker.name, worker.email, worker.phone, worker.address, worker.password,
                  worker.skills, worker.certifications, worker.experience, worker.description, worker.profile_photo,
                  worker.portfolio_files, worker.profileImage, worker.specializations, worker.rating,
                  worker.reviewCount, worker.successRate, worker.isAvailable, worker.latitude, worker.longitude,
                  worker.completedJobs, worker.hourlyRate, worker.bio, worker.documents, worker.availability
                ];
                db.query(workerSql, workerValues, (err) => {
                  if (err) console.error('❌ Error inserting worker:', err);
                });
              });
              console.log('Workers insert commands sent.');

              // Give a moment for all inserts to complete before closing connection
              setTimeout(() => {
                db.end((err) => {
                  if (err) console.error('❌ Error closing DB connection:', err);
                  else console.log('✅ Database connection closed.');
                  console.log('🎉 Database seeding complete.');
                  process.exit(0);
                });
              }, 2000); // Wait for 2 seconds
            });
          });
        });
      });
    });
  });
};

seedDatabase();
