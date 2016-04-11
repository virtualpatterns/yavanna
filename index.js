var Command = require('commander');
var Http = require('http');
var Package = require('./package.json');
var Stream = require('stream');
var QueryString = require('querystring');
var Utilities = require('util');

var DEFAULT_HOST = '192.168.2.1';
var DEFAULT_PATH = '/index.cgi?page=natpat&sessionid=%s';
var DEFAULT_USER = 'admin';
var DEFAULT_PASSWORD = 'admin';
var DEFAULT_SESSION_ID = '0000000000000000000000000000000';

Command
  .version(Package.version)
  .option('-H, --host <host>', Utilities.format('the router host, defaults to %s', DEFAULT_HOST))
  .option('-P, --path <path>', Utilities.format('the router path, defaults to  %s', DEFAULT_PATH))
  .option('-u, --user <user>', Utilities.format('the router user, defaults to %s', DEFAULT_USER))
  .option('-p, --password <password>', Utilities.format('the router password, defaults to %s', DEFAULT_PASSWORD))
  .option('-s, --sessionId <id>', Utilities.format('the session id, defaults to %s', DEFAULT_SESSION_ID));

Command
  .command('add <name> <sourcePort> <destinationAddress> <destinationPort> [protocol]')
  .description('Add a port-forwarding rule with the given name, addresses, and ports, defaults to both TCP and UDP')
  .action(function (name, sourcePort, destinationAddress, destinationPort, protocol, options) {

    protocol = protocol ? protocol.toUpperCase() : 0;

    switch (protocol) {
      case 'TCP':

        protocol = 6;

        break;

      case 'UDP':

        protocol = 17;

    }

    var host = options.host || DEFAULT_HOST;
    var path = options.path || DEFAULT_PATH;
    var user = options.user || DEFAULT_USER;
    var password = options.password || DEFAULT_PASSWORD;
    var sessionId = options.sessionId || DEFAULT_SESSION_ID;

    path = Utilities.format(path, sessionId);

    var requestData = QueryString.stringify({
      'page': 'natpat',
      'sessionid': sessionId,
      'action': 'submit',
      'nbrline': '0',
      'update': '1',
      'service0': '-2',
      'svcname0': name,
      'protocol0': protocol,
      'srcportx0': sourcePort,
      'device0': '-2',
      'ipname0': destinationAddress,
      'dstporty0': destinationPort,
    });

    var request = Http.request({
      'protocol': 'http:',
      'hostname': host,
      'port': 80,
      'path': path,
      'method': 'POST',
      'auth': Utilities.format('%s:%s', user, password),
      'headers': {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.8',
        'Authorization': 'Basic QVJBR09HOkJpZ1NwaWRlcg==',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Content-Length': requestData.length,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': host,
        'Origin': Utilities.format('http://%s', host),
        'Referer': Utilities.format('http://%s%s', host, path),
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
      }
    }, function(response) {

      response.setEncoding('utf8');

      var responseData = '';

      response.on('data', function(data) {
        responseData += data;
      });

      response.on('end', function() {
        console.log(Utilities.format('response.statusCode = \'%s\'', response.statusCode));
      });

    });

    request.on('error', function(error) {
      console.log(error.message);
    });

    request.write(requestData);
    request.end();

  });

Command.parse(process.argv);
