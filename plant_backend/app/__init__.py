"""FastAPI backend for AI-based crop disease detection.

The package is organised into configuration, HTTP API, service, and utility
modules. TensorFlow is imported lazily by the model service so importing the
package never incurs the framework's startup cost.
"""

__all__ = ["__version__"]

__version__ = "2.0.0"
