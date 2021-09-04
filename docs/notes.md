# Random notes

## AWS setup

Links:
- Setting up a NAT instance in place of NAT Gateway: https://www.kabisa.nl/tech/cost-saving-with-nat-instances/
- Run EC2's user data on reboot: https://aws.amazon.com/premiumsupport/knowledge-center/execute-user-data-ec2/

## Add records (to test inster not working on a reader node)

INSERT INTO books (title, description)
  VALUES ('Switch', 'A story about riders and elephants.');

INSERT INTO books (title, description)
  VALUES ('Litte Prince', 'Learn about little planets and roses.');

INSERT INTO books (title, description)
  VALUES ('The Peak', 'How to effectively master skills.');

ojsmPpy85bFqSKtPPFCb

## Test DNS

User data script

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd.service
systemctl enable httpd.service
EC2_AVAIL_ZONE=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
echo "<h1>Hello World from $(hostname -f) in AZ $EC2_AVAIL_ZONE</h1>" > /var/www/html/index.html
```