from buildbot.steps import shell
from buildbot.status.builder import FAILURE
from buildbot.process import logobserver
import re


class Trial(shell.ShellCommand):
    def __init__(self, **kwargs):
        shell.ShellCommand.__init__(self, **kwargs)
        self.addLogObserver('stdio', logobserver.LineConsumerLogObserver(self.logConsumer))
        self.failures = ""
        self.successes = ""

    name = "trial"

    def logConsumer(self):
        while True:
            stream, line = yield
            self.gatherTestStatistics(line)

    def gatherTestStatistics(self, line):
        m = re.search('failures=*(\d+)', line)
        if m:
            self.failures = m.group(1)
        m = re.search(r'successes=*(\d+)', line)
        if m:
            self.successes = m.group(1)

    def evaluateCommand(self, cmd):
        res = shell.ShellCommand.evaluateCommand(self, cmd)
        if self.failures:
            res = FAILURE
        return res

    def getResultSummary(self):
        cmdsummary = u""
        if self.failures and self.failures != "0":
            cmdsummary = "failures: " + self.failures
        if self.successes and self.successes != "0":
            if cmdsummary:
                cmdsummary = cmdsummary + ", "
            cmdsummary = cmdsummary + "successes: " + self.successes
        return {u'step': cmdsummary}


# UT begin

import unittest


class TrialTest(unittest.TestCase):
    def setUp(self):
        pass

    def test_failed_tests(self):
        line = "FAILED (failures=1, successes=2)"
        bs = Trial()
        bs.gatherTestStatistics(line)
        self.assertEqual("1", bs.failures)

    def test_passed_tests(self):
        line = "PASSED (successes=2)"
        bs = Trial()
        bs.gatherTestStatistics(line)
        self.assertEqual("2", bs.successes)


if __name__ == "__main__":
    unittest.main()

# UT end
