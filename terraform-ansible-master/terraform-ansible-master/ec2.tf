# key pair (login)
resource "aws_key_pair" "my_key_new" {
  key_name   = "terra-key-ansible"
  public_key = file("terra-key-ansible.pub")
}

# VPC & Security Group
resource "aws_default_vpc" "default" {

}

resource "aws_security_group" "my_security_group" {
  name        = "automate-sg"
  description = "this will add a TF generated Security group"
  vpc_id      = aws_default_vpc.default.id # interpolation

  # inbound rules
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH open"
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP open"
  }

  # outbound rules

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "all access open outbound"
  }

  tags = {
    Name = "automate-sg"
  }
}

# ec2 instance

resource "aws_instance" "my_instance" {
  for_each = tomap({
    TWS-Junoon-Master = "ami-0df368112825f8d8f", # ubuntu
    TWS-Junoon-1 = "ami-0df368112825f8d8f", #ubuntu
    TWS-Junoon-2 = "ami-09de149defa704528", #RedHat
    TWS-Junoon-3 = "ami-08f9a9c699d2ab3f9" # CentOs / Amazon Linux 2
  }) # meta argument

  depends_on = [ aws_security_group.my_security_group, aws_key_pair.my_key_new ]

  key_name        = aws_key_pair.my_key_new.key_name
  security_groups = [aws_security_group.my_security_group.name]
  instance_type   = "t2.micro"
  ami             = each.value
  root_block_device {
    volume_size = 10
    volume_type = "gp3"
  }
  tags = {
    Name = each.key
  }
}
