# demo-njs-app

A simple NodeJS app based on Koa useful for environment testing purposes.

The application exposes the following endpoints:

- GET `/` prints the hello world message with the value read from the config file relevant to a give environment
- GET `/info` prints:
  - hostname, port, environment of the server and the ip address of the client - those are read from env vars
- GET `/info/vault` or `/info/vault` prints:
  - secrets read from Vault
  - config from ConfigMap/Consul
- GET `/ping?size=50&delay=5000` prints a string of a given number of characters specified with `size` parameter with a response returned after a delay in miliseconds specified with `delay` parameter
- GET `/upstream` calls upstream service to get the count of lookup calls
  - requires two params: `service` and `endpoint`
- GET `/health` 
  - `/health/live`: liveness endpoint 
  - `/health/ready`: readiness endpoint
- `/debug`
  - GET `debug/shutdown/{exitCode}`: triggers application exit with a given exit code (shuts down the server process, handy for testing healthchecks)
  - GET `debug/health/startup`: gets current startup status
  - POST `debug/health/startup/{0/1}`: sets startup to pass or fail (pass by default)
  - GET `debug/health/ready`: gets current readiness status
  - POST `debug/health/ready/{0/1}`: sets readiness to pass or fail (pass by default)
  - GET `debug/health/live`: gets current liveness status
  - POST `debug/health/live/{0/1}`: sets liveness to pass or fail (pass by default)
  - GET `debug/health/probelogging`: gets current probe logging status
  - POST `debug/health/probelogging/{0/1}`: enables or disables logging for health paths (disabled by default)
  - GET `debug/shutdowndelay`: gets current shutdown delay value
  - POST `debug/shutdowndelay/1000`: enables shutdown delay for x miliseconds (1000 in this case), useful for testing pod behavior when shutting down the container
  - POST `debug/cputask/10000`: starts a CPU intensive task for x amount of ms (testing CPU throttling)
  - POST `debug/memalloc/512`: allocates x MBs to memory (testing OOM)
  - POST `debug/memclear`: clears previously created allocations from memory

Startup, readiness, liveness endpoints and probe logging can be also enabled or disabled at launch with the following **env vars**:
- `STARTUP_ON` (`"true"`/`"1"`/`"false"`/`"0"`)
- `READY_ON` (`"true"`/`"1"`/`"false"`/`"0"`)
- `LIVE_ON` (`"true"`/`"1"`/`"false"`/`"0"`)
- `PROBE_LOGGING_ON` (`"true"`/`"1"`/`"false"`/`"0"`)
- `SHUTDOWN_DELAY` (int value in miliseconds, i.e. `1000`)
- `STARTUP_DELAY` (int value in miliseconds, i.e. `1000`)

If the startup is set to be delayed, it can be resumed with the SIGCONT signal:
1. Check pid of the nodejs app process (` node index.js`): `kubectl exec <pod> -- ps aux`
2. Send signal to that process: `kubectl exec <pod> -- kill -SIGCONT <pid>`

## Deployment to AWS

User data for nodejs AMI:

```bash
#!/bin/bash -xe
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
  echo "Hello from user-data!"
  # User data scripts are run as the root user, so do not use the sudo command in the script
  # sudo su
  yum update -y
  yum install git -y
  curl --silent --location https://rpm.nodesource.com/setup_14.x | bash -
  yum -y install nodejs
```

See output log: /var/log/user-data.log

User data for app AMI on top of nodejs AMI:

```bash
#!/bin/bash -xe
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
  cd /home/ec2-user
  git clone https://github.com/wsierakowski/demo-njs-app.git
  cd demo-njs-app
  npm i
  npm start
```

User data for NAT instance:

```bash
#!/bin/bash -xe
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
  sysctl -w net.ipv4.ip_forward=1
  /sbin/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
```