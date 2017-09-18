---
title: Harvard's Odyssey Cluster
date: 2013-05-31
draft: true
---

# Useful References

* [Quickstart guide](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/)
    - [SSH](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/#Use_a_terminal_to_ssh_to_loginrcfasharvardedu)
    - [Copying files](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/#Transfer_any_files_you_may_need)
    - [Loading research software](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/#Determine_what_software_you39d_like_to_load_and_run)
* [GUI applications](https://rc.fas.harvard.edu/resources/access-and-login/#Consider_an_NX_remote_desktop_for_graphical_applications_like_Matlab_and_RStudio)
* [Password reset tool](https://account.rc.fas.harvard.edu/password_reset/)
* [Two factor authentication](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/#Setup_OpenAuth_for_two_factor_authentication)
* [Submitting an interactive job](https://rc.fas.harvard.edu/resources/odyssey-quickstart-guide/#_or_an_interactive_job)

    ```
    srun -p interact --pty --mem 500 -t 0-6:00 /bin/bash
    ```

*

sacct --starttime 2015-12-01 --format=JobID,JobName,ReqMem,MaxRSS,Elapsed,ExitCode

# Old stuff

# Running jobs

1.  [How to submit a job.][job-submission]
2.  [Where to submit your job.][job-queues]
3.  `lqueues` is a nice command for looking at the queues availabe for
    your use and their availability.
4.  Here is a [page][modules] on finding the right modules. Use
    `modulesearch` to find the module you need.
5.  Running compute-intensive jobs on the login node leads to a very
    courteous email to make better use of LSF. A quick way to get a
    `bash` prompt on a backend node can be done using the following
    `bsub` command:

        bsub -Is -q interact /bin/bash

I submitted a job to the `short_parallel` queue, it took a while for
the job to start up. I still need to learn the art of navigating this
system well. ~15 minutes is actually not too bad for the short
parallel queue.  The run time limit there is 1 hour, and our goal is
to keep pend time shorter than the run time.  The more cores (-n) and
ptile conditions you add, the longer the batch job system will have to
work to find slots to run it. The interactive queue is better for
exploratory work.

# Version of Hadoop installed

The current version of Hadoop installed on Odyssey is 1.0.4, the
current stable version is 1.1.X. I doubt this will be a big issue, but
it's worth keeping in mind.

# Running a Hadoop job

Create a bsub input file named bsub.in with the following contents:

    #BSUB -q short_parallel
    #BSUB -o job.out
    #BSUB -e job.err
    #BSUB -n 2
    #BSUB -R 'span[ptile=1]'
    
    export HADOOP_HOME=/n/sw/hadoop-1.0.4
    export JAVA_HOME=/n/sw/jdk1.6.0_30
    
    hpc-hadoop-mapreduce \
      hadoop jar "$HADOOP_HOME"/hadoop-examples-*.jar \
      grep input output 'mapred|queue'

Run the following commands:

    module load hpc/rc
    mkdir input
    cp /n/sw/hadoop-1.0.4/conf/*.xml input/
    bsub < bsub.in

A fuller explanation of this example can be found [here][hpc-hadoop].

# Running Python scripts

It looks like using full stack, and easy_install might be the way to
go:

    export PYTHONPATH=~/python:$PYTHONPATH
    easy_install --install-dir=~/python/ fabric

Incorporate John's email here.

# Editing remote files

I use `emacs` to edit files. `emacs` has a great package called
`tramp` for editing remote files using an `ssh`
connection. Unfortunately, I had a hard time using `tramp` with
Odyssey because `tramp` is unprepared for verification code prompt. As
a workaround I started using [SSHFS][SSHFS], which works even better
than `tramp`. Although `magit` works `SSHFS` it seems to be a little
too slow with my current connection, using `git` at the command line
seems slightly easier.

## Using git

I couldn't get ssh agent forwarding to work with odyssey. The
instructions I was following are [here][git-forward]. My first
workaround was to copy my local `.ssh` folder to Odyssey to work with
GitHub. But, after getting `SSHFS` working with Odyssey, now I just use git that's installed on my local machine. It's a little slow, but it works.

# Speed test of Hadoop

I think it would be informative to run some
[Hadoop benchmarks][hadoop-benchmark] on Odyssey.

[job-submission]: https://rc.fas.harvard.edu/kb/high-performance-computing/lsf-submit-an-lsf-job-2/
[job-queues]: https://rc.fas.harvard.edu/kb/high-performance-computing/general-use-odyssey-queues/
[hpc-hadoop]: https://github.com/fasrc/hpc-hadoop-mapreduce
[hadoop-benchmark]: http://www.michael-noll.com/blog/2011/04/09/benchmarking-and-stress-testing-an-hadoop-cluster-with-terasort-testdfsio-nnbench-mrbench/
[odyssey-python]:
https://rc.fas.harvard.edu/kb/high-performance-computing/configuring-an-ipython-cluster-2/
[virtualenv]: http://stackoverflow.com/questions/4324558/whats-the-proper-way-to-install-pip-virtualenv-and-distribute-for-python
[modules]: http://rc.fas.harvard.edu/kb/high-performance-computing/modules-let-you-access-different-software-packages-on-odyssey/
[SSHFS]: https://help.ubuntu.com/community/SSHFS
[hadoop-local-install]: http://www.michael-noll.com/tutorials/running-hadoop-on-ubuntu-linux-single-node-cluster/#installation

