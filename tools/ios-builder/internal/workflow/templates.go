package workflow

import (
	_ "embed"
)

//go:embed templates/ios-build.yml
var IOSBuildWorkflow []byte

func IOSBuildWorkflowContent() string {
	return string(IOSBuildWorkflow)
}