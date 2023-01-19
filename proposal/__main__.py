import sys


def main():
    try:
        from .core import start
        sys.exit(start())
    except KeyboardInterrupt:
        sys.exit()


if __name__ == '__main__':
    main()
