variable "aws_region" {
  description = "Primary AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "kala"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Primary web domain"
  type        = string
  default     = "kalaaa.in"
}

variable "api_domain" {
  description = "API domain name"
  type        = string
  default     = "api.kalaaa.in"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "kala_admin"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "kala"
}

