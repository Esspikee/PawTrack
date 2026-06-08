import logging
import sys

LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> None:
    root_logger = logging.getLogger()
    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        root_logger.setLevel(level)
        root_logger.addHandler(handler)
    else:
        root_logger.setLevel(level)
        for handler in root_logger.handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.setFormatter(formatter)


def get_logger(name: str = __name__, level: int = logging.INFO) -> logging.Logger:
    setup_logging(level)
    logger = logging.getLogger(name)
    logger.setLevel(level)
    return logger
