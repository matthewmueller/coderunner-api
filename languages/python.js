/**
 * Install
 */

exports.install = [
  'pip install -r requirements.txt',
  'mv /usr/local/lib/python3.3/dist-packages /home'
];

/**
 * Dependency file
 */

exports.dependencies = 'requirements.txt';

/**
 * Run
 */

exports.run = [
  'rm -rf /usr/local/lib/python3.3/dist-packages/',
  '[ -d /home/dist-packages ] && mv /home/dist-packages /usr/local/lib/python3.3/',
  'python3.3 setup.py'
]
