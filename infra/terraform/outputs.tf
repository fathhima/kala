output "rds_endpoint" {
  description = "PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "PostgreSQL hostname"
  value       = aws_db_instance.postgres.address
}

output "elasticache_endpoint" {
  description = "Redis / Valkey hostname"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "ecr_repository_url" {
  description = "ECR Docker repository URL"
  value       = aws_ecr_repository.api.repository_url
}

output "alb_dns_name" {
  description = "ALB DNS Name (Target for api.kalaaa.in CNAME)"
  value       = aws_lb.api.dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront Domain Name (Target for kalaaa.in CNAME)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "s3_frontend_bucket_name" {
  description = "Frontend S3 bucket"
  value       = aws_s3_bucket.frontend.id
}

output "acm_frontend_domain_validation" {
  description = "DNS CNAME records needed in Cloudflare for frontend SSL validation"
  value       = aws_acm_certificate.frontend.domain_validation_options
}

output "acm_api_domain_validation" {
  description = "DNS CNAME records needed in Cloudflare for api SSL validation"
  value       = aws_acm_certificate.api.domain_validation_options
}

