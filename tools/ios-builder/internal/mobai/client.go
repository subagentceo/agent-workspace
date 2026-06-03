package mobai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const (
	DefaultBaseURL = "http://localhost:8686"
)

type Client struct {
	httpClient *http.Client
	baseURL    string
}

func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	return &Client{
		httpClient: &http.Client{},
		baseURL:    strings.TrimSuffix(baseURL, "/"),
	}
}

func (c *Client) do(ctx context.Context, method, path string, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil { return nil, err }
		bodyReader = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, bodyReader)
	if err != nil { return nil, err }
	if body != nil { req.Header.Set("Content-Type", "application/json") }
	return c.httpClient.Do(req)
}

func (c *Client) ListDevices(ctx context.Context) ([]Device, error) {
	resp, err := c.do(ctx, "GET", "/api/v1/devices", nil)
	if err != nil { return nil, err }
	defer resp.Body.Close()
	var result struct{ Devices []Device `json:"devices"` }
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil { return nil, err }
	return result.Devices, nil
}

func (c *Client) InstallApp(ctx context.Context, deviceID, ipaPath string) error {
	body := map[string]string{"device_id": deviceID, "ipa_path": ipaPath}
	resp, err := c.do(ctx, "POST", "/api/v1/apps/install", body)
	if err != nil { return err }
	defer resp.Body.Close()
	if resp.StatusCode >= 300 { return fmt.Errorf("install failed: HTTP %d", resp.StatusCode) }
	return nil
}