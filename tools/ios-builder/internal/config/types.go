package config

type Config struct {
	Project  string    `json:"project"`
	Platform string    `json:"platform"`
	GitHub   GitHubConfig `json:"github"`
	IOS      IOSConfig    `json:"ios"`
	Signing  *SigningConfig `json:"signing,omitempty"`
}

type GitHubConfig struct {
	Owner  string `json:"owner"`
	Repo   string `json:"repo"`
	Remote string `json:"remote,omitempty"`
}

type IOSConfig struct {
	Path   string `json:"path"`
	Scheme string `json:"scheme,omitempty"`
}

type SigningConfig struct {
	CertificateSecret       string `json:"certificate_secret,omitempty"`
	CertificatePasswordSecret string `json:"certificate_password_secret,omitempty"`
	ProvisioningProfileSecret string `json:"provisioning_profile_secret,omitempty"`
}